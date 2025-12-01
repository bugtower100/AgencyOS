export const excludeHueRanges: [number, number][] = [
  [35, 200], // 排除黄色、绿色、青色范围
]

// Cache the allowed ranges since they only depend on the constant excludeHueRanges
let cachedAllowedRanges: [number, number][] | null = null

// Calculate allowed hue ranges by subtracting excluded intervals from full [0, 360) range
const computeAllowedRanges = (): [number, number][] => {
  // Return cached result if available
  if (cachedAllowedRanges) {
    return cachedAllowedRanges
  }

  // Sort excluded ranges by start value to ensure proper processing
  const excluded = [...excludeHueRanges].sort((a, b) => a[0] - b[0])
  const allowed: [number, number][] = []
  let cursor = 0

  // Iterate through excluded ranges and collect allowed intervals
  for (const [start, end] of excluded) {
    if (start > cursor) {
      allowed.push([cursor, start])
    }
    cursor = Math.max(cursor, end)
  }

  // Add the final allowed range if cursor is less than 360
  if (cursor < 360) {
    allowed.push([cursor, 360])
  }

  // Cache and return the result
  cachedAllowedRanges = allowed
  return allowed
}

/**
 * Generates a palette of distinct HSL colors by distributing them across allowed hue ranges.
 * @param n Number of colors to generate
 * @param offset Hue offset to start from
 * @returns Array of HSL color strings
 */
export const generatePalette = (n: number, offset = 0): string[] => {
  if (n <= 0) {
    return []
  }

  const allowed = computeAllowedRanges()
  const spans = allowed.map(([start, end]) => end - start)
  const totalSpan = spans.reduce((sum, span) => sum + span, 0)

  // Fallback to full spectrum if all ranges are excluded
  if (totalSpan <= 0) {
    return Array.from({ length: n }, (_, i) => {
      const hue = Math.round((i * (360 / n) + offset) % 360)
      return `hsl(${hue}, 62%, 52%)`
    })
  }

  // Generate colors by distributing them evenly across allowed ranges
  return Array.from({ length: n }, (_, i) => {
    // Calculate position evenly across the total allowed span
    const pos = ((i + 0.5) / n * totalSpan + offset) % totalSpan
    let remainingPos = pos
    let hue = 0

    // Find which allowed range contains this position
    for (let j = 0; j < allowed.length; j++) {
      const [start] = allowed[j]
      const span = spans[j]
      
      if (remainingPos < span) {
        hue = start + remainingPos
        break
      }
      
      remainingPos -= span
    }

    // Ensure hue is within 0-359 range
    hue = Math.floor(hue) % 360
    return `hsl(${hue}, 62%, 52%)`
  })
}

export default generatePalette
