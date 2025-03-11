export function formatDate(date: Date): string {
  try {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diff / 1000 / 60)
    const diffHours = Math.floor(diffMinutes / 60)

    // Less than 24 hours ago - show relative time
    if (diffHours < 24) {
      if (diffMinutes < 1) return 'just now'
      if (diffMinutes === 1) return '1 minute ago'
      if (diffMinutes < 60) return `${diffMinutes} minutes ago`
      if (diffHours === 1) return '1 hour ago'
      return `${diffHours} hours ago`
    }

    // More than 24 hours - show formatted date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function formatAmount(amount: number, decimals: number = 8): string {
  // Convert to fixed number of decimals
  const fixed = amount.toFixed(decimals)
  
  // Split into whole and decimal parts
  const [whole, decimal] = fixed.split('.')
  
  // Format the whole number part with commas
  const formattedWhole = Number(whole).toLocaleString('en-US')
  
  if (!decimal) {
    return `${formattedWhole}.0`
  }

  // Trim trailing zeros but keep significant ones
  const trimmedDecimal = decimal.replace(/0+$/, '')
  
  // If all decimals were zeros, return with one zero after decimal
  if (!trimmedDecimal) {
    return `${formattedWhole}.0`
  }
  
  return `${formattedWhole}.${trimmedDecimal}`
}

// Example outputs:
// formatAmount(0.00001000) -> "0.00001"
// formatAmount(1.23000000) -> "1.23"
// formatAmount(1.00000000) -> "1.0"
// formatAmount(1000.00000100) -> "1,000.000001"
// formatAmount(0.00000001) -> "0.00000001"