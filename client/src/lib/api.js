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

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
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
// Admin-specific endpoints
// ---------------------------------------------------------------------------

export const adminApi = {
  /**
   * GET /api/admin/dashboard
   * Expected response shape:
   * { totalBookings, totalRevenue, totalUser, activeShows[] }
   */
  getDashboard: () => api.get('/admin/dashboard'),

  /**
   * GET /api/admin/shows
   */
  getShows: () => api.get('/admin/shows'),

  /**
   * GET /api/admin/bookings
   */
  getBookings: () => api.get('/admin/bookings'),

  /**
   * GET /api/movies  (or /api/admin/movies)
   * Returns the list of all movies available for creating shows.
   */
  getMovies: () => api.get('/movies'),

  /**
   * POST /api/admin/shows
   * Body: { movieId, showPrice, dateTimes[] }
   * Creates one or more shows for the given movie at the selected times.
   */
  createShow: (data) => api.post('/admin/shows', data),
}

export default api