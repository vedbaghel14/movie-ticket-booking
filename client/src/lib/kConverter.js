/**
 * Converts a vote count to a human-readable "k" format.
 * e.g. 15000 → "15k", 27500 → "27.5k", 800 → "800"
 *
 * Used in the AddShows movie picker (matching the video tutorial).
 */
export function kConverter(num) {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return String(num)
}

export default kConverter