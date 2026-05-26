// ---------------------------------------------------------------------------
// API utility – centralised fetch wrapper
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

/**
 * Thin wrapper around the native Fetch API.
 *
 * - Prepends the base URL automatically.
 * - Parses JSON responses.
 * - Throws a descriptive error when the request fails so callers can
 *   distinguish network / server errors from empty responses.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`

  const { headers, ...restOptions } = options

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed (${res.status})`)
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

export const api = {
  get: (endpoint, options) =>
    apiFetch(endpoint, { method: 'GET', ...options }),

  post: (endpoint, data, options) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  put: (endpoint, data, options) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  patch: (endpoint, data, options) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (endpoint, options) =>
    apiFetch(endpoint, { method: 'DELETE', ...options }),
}

// ---------------------------------------------------------------------------
// Admin-specific endpoints  (all require Clerk auth token header)
// ---------------------------------------------------------------------------

export const adminApi = {
  /**
   * GET /api/admin/dashboard
   * Response: { success, dashboardData: { totalBookings, totalRevenue, totalUser, activeShows[] } }
   */
  getDashboard: (token) =>
    api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),

  /**
   * GET /api/admin/all-shows
   */
  getShows: (token) =>
    api.get('/admin/all-shows', { headers: { Authorization: `Bearer ${token}` } }),

  /**
   * GET /api/admin/all-bookings
   */
  getBookings: (token) =>
    api.get('/admin/all-bookings', { headers: { Authorization: `Bearer ${token}` } }),

  /**
   * GET /api/shows/nowplaying — fetches now-playing movies from TMDB
   */
  getNowPlayingMovies: (token) =>
    api.get('/shows/nowplaying', { headers: { Authorization: `Bearer ${token}` } }),

  /**
   * POST /api/shows/add
   * Body: { movieId, showsInput: [{ date, time: [] }], showPrice }
   */
  createShow: (data, token) =>
    api.post('/shows/add', data, { headers: { Authorization: `Bearer ${token}` } }),
}

// ---------------------------------------------------------------------------
// Public show endpoints  (no auth required)
// ---------------------------------------------------------------------------

export const showApi = {
  /**
   * GET /api/shows/all  — list of unique movies with active shows
   * Response: { success, shows: movie[] }
   */
  getAll: () => api.get('/shows/all'),

  /**
   * GET /api/shows/:movieId  — dates × times for a single movie
   * Response: { success, dateTime: {}, movie }
   */
  getSingle: (movieId) => api.get(`/shows/${movieId}`),

  /**
   * GET /api/shows/public/nowplaying  — now playing movies from TMDB (public)
   * Response: { success, movies: movie[] }
   */
  getPublicNowPlaying: () => api.get('/shows/public/nowplaying'),

  /**
   * GET /api/shows/public/trailers  — YouTube trailers for now playing movies (public)
   * Response: { success, trailers: [{ image, videoUrl, title }] }
   */
  getPublicTrailers: () => api.get('/shows/public/trailers'),
}

// ---------------------------------------------------------------------------
// Booking endpoints
// ---------------------------------------------------------------------------

export const bookingApi = {
  /**
   * GET /api/booking/seats/:showId
   * Response: { success, occupiedSeats: string[] }
   */
  getOccupiedSeats: (showId) => api.get(`/booking/seats/${showId}`),

  /**
   * POST /api/booking/create
   * Body: { showId, selectedSeats: string[] }
   * Auth header with Clerk token required.
   */
  create: (data, token) =>
    api.post('/booking/create', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

// ---------------------------------------------------------------------------
// User endpoints  (require Clerk auth token)
// ---------------------------------------------------------------------------

export const userApi = {
  /**
   * GET /api/user/bookings
   * Response: { success, bookings }
   */
  getBookings: (token) =>
    api.get('/user/bookings', { headers: { Authorization: `Bearer ${token}` } }),

  /**
   * POST /api/user/update-favourite
   * Body: { movieId }
   */
  toggleFavourite: (movieId, token) =>
    api.post('/user/update-favourite', { movieId }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * GET /api/user/favourites
   * Response: { success, movies }
   */
  getFavourites: (token) =>
    api.get('/user/favourites', { headers: { Authorization: `Bearer ${token}` } }),
}

export default api