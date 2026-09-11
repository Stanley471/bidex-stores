"use client";

interface CatalogPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function CatalogPagination({ page, pageCount, onPageChange }: CatalogPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-primary hover:text-brand-primary transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm font-medium text-slate-700">Page {page} of {pageCount}</span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-primary hover:text-brand-primary transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
