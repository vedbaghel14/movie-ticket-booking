const tmdb = require('../lib/tmdb')
const movieModel = require('../models/movies.model')
const showModel = require('../models/show.model')

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// ---- helper: fetch TMDB now-playing & genres, upsert into MongoDB, return movies ----
const fetchAndUpsertNowPlaying = async () => {
    const [nowPlayingRes, genreRes] = await Promise.all([
        tmdb.get('/movie/now_playing'),
        tmdb.get('/genre/movie/list'),
    ])

    const genreMap = {}
    genreRes.data.genres.forEach(g => { genreMap[g.id] = g.name })

    const movies = nowPlayingRes.data.results.map(movie => ({
        _id: String(movie.id),
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
        backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
        genres: (movie.genre_ids || []).map(gid => ({ id: gid, name: genreMap[gid] || 'Unknown' })),
        release_date: movie.release_date,
        original_language: movie.original_language,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
    }))

    // Bulk upsert (fire-and-forget — data is returned in-memory immediately)
    if (movies.length > 0) {
        const ops = movies.map(m => ({
            updateOne: {
                filter: { _id: m._id },
                update: { $setOnInsert: m },
                upsert: true,
            }
        }))
        movieModel.bulkWrite(ops).catch(err =>
            console.error('[fetchAndUpsert] bulkWrite failed:', err.message)
        )
    }

    return movies
}

// ---- helper: gracefully return movies — TMDB first, then DB fallback ----
const getNowPlayingSafe = async () => {
    try {
        return await fetchAndUpsertNowPlaying()
    } catch (tmdbErr) {
        console.warn('[getNowPlayingSafe] TMDB unreachable, serving DB cache:', tmdbErr.code || tmdbErr.message)
        // Return any movies already in the database as a fallback
        const cached = await movieModel.find({}).sort({ createdAt: -1 }).limit(20).lean()
        return cached
    }
}

//Api to get now playing movies from TMDB  (admin — saves to DB)
const getNowPlaying = async (req, res) => {
    try {
        const movies = await getNowPlayingSafe()
        res.json({ success: true, movies })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}

//Api to add shows to the database
const addShow = async (req, res) => {
    const { movieId, showsInput, showPrice } = req.body;
    try {

        // Always fetch full movie details from TMDB and upsert, so that
        // partial records saved by getPublicNowPlaying get enriched with
        // casts, runtime, tagline, etc.
        const [movieDetailsResponse, movieCreditResponse] = await Promise.all([
            tmdb.get(`/movie/${movieId}`),
            tmdb.get(`/movie/${movieId}/credits`),
        ]);

        const movieApiData = movieDetailsResponse.data;
        const movieCreditApiData = movieCreditResponse.data;

        const movieData = {
            title: movieApiData.title,
            overview: movieApiData.overview,
            poster_path: movieApiData.poster_path ? `${TMDB_IMAGE_BASE}${movieApiData.poster_path}` : null,
            backdrop_path: movieApiData.backdrop_path ? `${TMDB_IMAGE_BASE}${movieApiData.backdrop_path}` : null,
            genres: movieApiData.genres,
            casts: (movieCreditApiData.cast || []).map(c => ({
                ...c,
                profile_path: c.profile_path ? `${TMDB_IMAGE_BASE}${c.profile_path}` : null,
            })),
            release_date: movieApiData.release_date,
            original_language: movieApiData.original_language,
            tagline: movieApiData.tagline || "",
            vote_average: movieApiData.vote_average,
            vote_count: movieApiData.vote_count,
            runtime: movieApiData.runtime,
        }

        // Upsert: update existing movie (fills in missing fields) or insert new
        await movieModel.findOneAndUpdate(
            { _id: movieId },
            { $set: movieData },
            { upsert: true, new: true }
        );

        // showsInput is now an array of UTC ISO strings from the frontend,
        // e.g. ["2026-05-26T13:00:00.000Z", "2026-05-26T15:30:00.000Z"]
        const showsToCreate = [];
        showsInput.forEach((iso) => {
            const dateTime = new Date(iso);
            if (isNaN(dateTime.getTime())) {
                console.warn('[addShow] Skipping invalid date:', iso);
                return;
            }
            showsToCreate.push({
                movie: movieId,
                showDateTime: dateTime,
                showPrice,
                occupiedSeats: {},
            });
        });
        if (showsToCreate.length > 0) {
            await showModel.insertMany(showsToCreate);
        }
        res.json({ success: true, message: "show added successfully" })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}

//Api to get all shows from database
const getAllShows = async (req, res) => {
    try {
        const now = new Date()
        const allShows = await showModel.find({}).populate('movie').sort({ showDateTime: 1 });

        // Filter client-side to handle both Date objects and string dates safely
        const futureShows = allShows.filter(show => {
            const dt = show.showDateTime instanceof Date
                ? show.showDateTime
                : new Date(show.showDateTime);
            return !isNaN(dt.getTime()) && dt >= now;
        });

        const uniqueShows = new Set(futureShows.map(show => show.movie))

        res.json({ success: true, shows: Array.from(uniqueShows) })

    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}

//Api to get single show
const getSingleShow = async (req, res) => {

    try {
        const { movieId } = req.params;

        // Fetch movie from DB first. If it doesn't exist yet (e.g. direct
        // navigation to /movie/:id without visiting the list page first),
        // fetch it from TMDB and seed the DB.
        let movie = await movieModel.findById(movieId)
        if (!movie) {
            try {
                const [{ data: movieApiData }, { data: creditData }] = await Promise.all([
                    tmdb.get(`/movie/${movieId}`),
                    tmdb.get(`/movie/${movieId}/credits`),
                ])
                movie = await movieModel.findOneAndUpdate(
                    { _id: movieId },
                    {
                        $setOnInsert: {
                            _id: movieId,
                            title: movieApiData.title,
                            overview: movieApiData.overview,
                            poster_path: movieApiData.poster_path ? `${TMDB_IMAGE_BASE}${movieApiData.poster_path}` : null,
                            backdrop_path: movieApiData.backdrop_path ? `${TMDB_IMAGE_BASE}${movieApiData.backdrop_path}` : null,
                            genres: movieApiData.genres || [],
                            casts: (creditData.cast || []).map(c => ({
                                ...c,
                                profile_path: c.profile_path ? `${TMDB_IMAGE_BASE}${c.profile_path}` : null,
                            })),
                            release_date: movieApiData.release_date,
                            original_language: movieApiData.original_language,
                            tagline: movieApiData.tagline || '',
                            vote_average: movieApiData.vote_average,
                            vote_count: movieApiData.vote_count,
                            runtime: movieApiData.runtime || 0,
                        }
                    },
                    { upsert: true, new: true }
                )
            } catch (tmdbErr) {
                console.warn('[getSingleShow] TMDB fetch failed for', movieId, tmdbErr.code || tmdbErr.message)
            }
        }

        // Try MongoDB native Date comparison first (works with proper Date objects)
        const shows = await showModel.find({
            movie: movieId,
            showDateTime: { $gte: new Date() }
        }).sort({ showDateTime: 1 });

        // If the above query returns nothing, fall back to all shows (no date
        // filter) — the frontend decides which dates to show.
        const effectiveShows = shows.length > 0 ? shows : await showModel.find({ movie: movieId }).sort({ showDateTime: 1 });

        const dateTime = {}
        effectiveShows.forEach(show => {
            // Safely handle both Date objects and date strings
            const dateObj = show.showDateTime instanceof Date
                ? show.showDateTime
                : new Date(show.showDateTime);

            if (isNaN(dateObj.getTime())) return; // skip invalid dates

            const date = dateObj.toISOString().split('T')[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: dateObj.toISOString(), showid: show._id })
        })

        res.json({ success: true, dateTime, movie })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}



//Api to get now playing movies from TMDB  (public — no auth required)
const getPublicNowPlaying = async (req, res) => {
    try {
        const movies = await getNowPlayingSafe()
        res.json({ success: true, movies })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}

//Api to get movie videos (trailers) from TMDB
const getPublicTrailers = async (req, res) => {
    try {
        // Fetch now playing movies, then get trailers for the top ones
        const { data } = await tmdb.get('/movie/now_playing')

        const topMovies = data.results.slice(0, 6)

        const trailerResults = await Promise.allSettled(
            topMovies.map(async (movie) => {
                const { data: videoData } = await tmdb.get(`/movie/${movie.id}/videos`)
                const trailer = videoData.results.find(
                    (v) => v.type === 'Trailer' && v.site === 'YouTube'
                ) || videoData.results[0]

                return trailer ? {
                    image: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
                    videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`,
                    title: movie.title,
                } : null
            })
        )

        const trailers = trailerResults
            .filter((r) => r.status === 'fulfilled' && r.value)
            .map((r) => r.value)

        res.json({ success: true, trailers })
    }
    catch (err) {
        console.log(err)
        // Return empty trailers on failure — the frontend shows a loading
        // state already, and an empty list is not an error for the user.
        res.json({ success: true, trailers: [] })
    }
}

module.exports = {
    getNowPlaying, addShow, getAllShows, getSingleShow,
    getPublicNowPlaying, getPublicTrailers,
}
