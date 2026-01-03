// Simple utility functions
export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Get avatar URL for a user
 * Uses their avatar if available, otherwise generates one from their name
 */
export function getAvatarUrl(name: string, avatar?: string | null): string {
  if (avatar && avatar.trim() !== '') {
    return avatar
  }
  if (!name) {
    return 'https://ui-avatars.com/api/?name=User&background=random'
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

