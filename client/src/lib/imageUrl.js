/** Safely resolve a TMDB image path — prepend base URL if missing */
export const imageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w500${path}`
}