import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
      {...props}
    />
  )
}

export function SkeletonProductCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      {/* Product Image Area */}
      <Skeleton className="h-52 w-full rounded-xl" />
      
      {/* Details Area */}
      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <div className="mt-1 flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCategoryCard() {
  return (
    <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/60 text-center space-y-2">
      <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl" />
      <Skeleton className="h-3.5 w-16 rounded-md" />
      <Skeleton className="h-2.5 w-12 rounded-md" />
    </div>
  )
}

export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full rounded-md" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 rounded-md ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}
