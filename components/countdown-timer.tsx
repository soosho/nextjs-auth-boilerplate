"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetTime: number
  onComplete?: () => void
}

// Add debugging and better time handling
export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("0:00")

  useEffect(() => {
    let interval: NodeJS.Timeout

    const calculateTimeLeft = () => {
      const now = Date.now()
      const diff = targetTime - now

      // Debug log
      console.log('Time diff:', {
        targetTime,
        now,
        diff,
        readableTarget: new Date(targetTime).toISOString()
      })

      if (diff <= 0) {
        setTimeLeft("0:00")
        if (onComplete) onComplete()
        if (interval) clearInterval(interval)
        return false
      }

      const totalSeconds = Math.floor(diff / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
      
      setTimeLeft(timeString)
      return true
    }

    if (calculateTimeLeft()) {
      interval = setInterval(calculateTimeLeft, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [targetTime, onComplete])

  return <span className="font-mono">{timeLeft}</span>
}