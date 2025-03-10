import Image from "next/image"
import { useState } from "react"

interface CurrencyIconProps {
  symbol: string
  name: string
}

export function CurrencyIcon({ symbol, name }: CurrencyIconProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">
          {symbol.slice(0, 3)}
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-8 w-8">
      <Image
        src={`/icons/coins/${symbol.toLowerCase()}.webp`}
        alt={name}
        fill
        className="rounded-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}