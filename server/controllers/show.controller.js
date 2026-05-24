const axios = require('axios');
const movieModel = require('../models/movies.model')
const showModel = require('../models/show.model')
//Api to get now playing movies from TMDB
const getNowPlaying = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        })
        const movies = data.results;
        res.json({ success: true, movies: movies })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.messae })
    }
}

//Api to add shows to the database
const addShow = async (req, res) => {
    const { movieId, showsInput, showPrice } = req.body;
    try {

        const movie = await movieModel.findById(movieId);
        if (!movie) {
            const movieDetailsResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                }
            );

            const movieCreditResponse = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    }
                }
            );
            const movieApiData = movieDetailsResponse.data;
            const movieCreditApiData = movieCreditResponse.data;
            const movieData = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditApiData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                vote_count: movieApiData.vote_count,
                runtime: movieApiData.runtime,
            }
            await movieModel.create(movieData);
        }
        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            const showTime = show.time;
            showTime.forEach(time => {
                const dateTimeString = `${showDate}T${time}`
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: dateTimeString,
                    showPrice,
                    occupiedSeats: {}
                })
            })
        })
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
        const shows = await showModel.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        const uniqueShows = new Set(shows.map(show => show.movie))

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
        const shows = await showModel.find({ movie: movieId, showDateTime: { $gte: new Date() } }).sort({ showDateTime: 1 });
        const movie = await movieModel.findById(movieId)
        const dateTime = {}
        shows.forEach(show => {
            const date = show.showDateTime.toISOString().split('T')[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showid: show._id })

        })
        res.json({ success: true, dateTime, movie })
    }
    catch (err) {
        console.log(err)
        res.json({ success: false, err: err.message })
    }
}



module.exports = {
    getNowPlaying, addShow, getAllShows, getSingleShow
}
