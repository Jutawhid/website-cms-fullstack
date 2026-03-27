import React from 'react';

export interface PaginationMeta {
  total_items: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

interface PaginatedTableProps {
  headers: string[];
  loading?: boolean;
  error?: string;
  isEmpty: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  meta: PaginationMeta | null;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}

export default function PaginatedTable({
  headers,
  loading,
  error,
  isEmpty,
  emptyMessage = "No records found.",
  emptySubtext = "Create a new record to see it here.",
  meta,
  onPageChange,
  children
}: PaginatedTableProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* 1. Handling Three Loading/Error/Empty States Generically */}
      {loading ? (
        <div className="p-8 animate-pulse flex flex-col justify-center items-center h-full">
          <div className="h-8 bg-gray-100 rounded-md w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-100 rounded-md w-full mb-4"></div>
          <div className="h-8 bg-gray-100 rounded-md w-5/6"></div>
        </div>
      ) : error ? (
        <div className="p-8">
          <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl font-medium">{error}</div>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20 bg-gray-50 h-[300px] flex flex-col justify-center rounded-b-xl border-t border-gray-100">
          <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
          <p className="text-gray-400 text-sm mt-2">{emptySubtext}</p>
        </div>
      ) : (
        /* 2. Generic Table Skeleton */
        <div className="overflow-x-auto w-full border-b border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                {headers.map((header, idx) => (
                  <th key={idx} className={`p-5 font-semibold border-b border-gray-200 ${idx === headers.length - 1 ? 'text-right' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {children}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Reusable Responsive Generic Pagination Controls */}
      {meta && meta.total_pages > 1 && !loading && !error && !isEmpty && (
        <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-xl">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Showing <span className="font-bold text-gray-900">{((meta.current_page - 1) * meta.limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(meta.current_page * meta.limit, meta.total_items)}</span> of <span className="font-bold text-gray-900">{meta.total_items}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm bg-white" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(meta.current_page - 1, 1))}
                  disabled={meta.current_page === 1}
                  className="relative inline-flex items-center rounded-l-lg px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:bg-gray-100 transition-all font-medium text-sm"
                >
                  <span>&larr; Prev</span>
                </button>
                
                {[...Array(meta.total_pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => onPageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-bold focus:z-20 transition-all ${
                      meta.current_page === i + 1 
                      ? 'z-10 bg-indigo-600 text-white' 
                      : 'text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => onPageChange(Math.min(meta.current_page + 1, meta.total_pages))}
                  disabled={meta.current_page === meta.total_pages}
                  className="relative inline-flex items-center rounded-r-lg px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:bg-gray-100 transition-all font-medium text-sm"
                >
                  <span>Next &rarr;</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
