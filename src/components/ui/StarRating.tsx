'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number
  reviewCount?: number
  showText?: boolean
  className?: string
  starSizeClass?: string
}

export function StarRating({
  rating = 0,
  reviewCount = 0,
  showText = true,
  className = '',
  starSizeClass = 'h-3.5 w-3.5',
}: StarRatingProps) {
  const hasReviews = Boolean(reviewCount && reviewCount > 0)
  const displayRating = hasReviews ? Math.min(5, Math.max(0, rating)) : 0

  if (!hasReviews) {
    return (
      <div className={`flex items-center text-[10px] sm:text-xs text-slate-400 ${className}`}>
        <div className="flex items-center text-slate-300 shrink-0" aria-label="0 out of 5 stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`${starSizeClass} fill-none text-slate-300`} />
          ))}
        </div>
        {showText && (
          <span className="ml-1 text-[10px] sm:text-xs text-slate-400 font-normal whitespace-nowrap">
            (0)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center text-[10px] sm:text-xs text-slate-600 font-medium ${className}`}>
      <div className="flex items-center text-amber-400 shrink-0" aria-label={`${displayRating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating)
          return (
            <Star
              key={star}
              className={`${starSizeClass} ${
                isFilled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'
              }`}
            />
          )
        })}
      </div>
      {showText && (
        <span className="ml-1 text-[10px] sm:text-xs text-slate-500 font-normal whitespace-nowrap">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
