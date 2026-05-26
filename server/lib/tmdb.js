// ---------------------------------------------------------------------------
// Resilient TMDB API client — shared axios instance with retry, timeout,
// connection pooling, and keep-alive.
// ---------------------------------------------------------------------------

const axios = require('axios')

const TMDB_BASE = 'https://api.themoviedb.org/3'

/**
 * Exponential backoff helper.
 * Delays: ~1s, ~2s, ~4s with ±20% jitter so retries don't thundering-herd.
 */
const backoff = (attempt) =>
  new Promise((resolve) =>
    setTimeout(resolve, (Math.pow(2, attempt) * 1000) * (0.8 + Math.random() * 0.4))
  )

/**
 * Axios instance pre-configured for TMDB.
 *
 * - `timeout`:  10 s — prevents hanging connections
 * - `keepAlive`: reuses TCP connections (avoids TLS handshake per request)
 * - Retry loop:  up to 3 attempts on retryable errors (ECONNRESET, ETIMEDOUT,
 *    ENOTFOUND, 5xx)
 */
const tmdb = axios.create({
  baseURL: TMDB_BASE,
  timeout: 10_000,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    'Accept-Encoding': 'gzip, compress, deflate, br',
  },
  // Keep-Alive agent for connection reuse
  httpAgent: new (require('http').Agent)({ keepAlive: true }),
  httpsAgent: new (require('https').Agent)({ keepAlive: true }),
})

// ---- retry interceptor ----
tmdb.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // Only retry if we haven't already tried 3 times
    config.__retryCount = config.__retryCount ?? 0

    const retryable =
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'EAI_AGAIN' ||
      (error.response && error.response.status >= 500)

    if (retryable && config.__retryCount < 3) {
      config.__retryCount += 1
      console.warn(
        `[tmdb] Retry ${config.__retryCount}/3 for ${config.url} (${error.code || error.response?.status})`
      )
      await backoff(config.__retryCount)
      return tmdb(config)
    }

    return Promise.reject(error)
  }
)

module.exports = tmdb