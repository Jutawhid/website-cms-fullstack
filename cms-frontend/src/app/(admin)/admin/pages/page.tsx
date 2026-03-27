"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import PaginatedTable, { PaginationMeta } from '@/components/ui/PaginatedTable';

// Interface matching our Golang models.Page blueprint
interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  author: { email: string };
}

export default function PagesTable() {
  const [pages, setPages] = useState<Page[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPages = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/pages?page=${page}&limit=5`);
      setPages(response.data.data);
      setMeta({
        total_items: response.data.total_items,
        total_pages: response.data.total_pages,
        current_page: response.data.current_page,
        limit: response.data.limit,
      });
    } catch (err: any) {
      console.error("Failed to fetch pages:", err);
      setError("Failed to load CMS pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this page?")) return;
    try {
      await api.delete(`/api/v1/pages/${id}`);
      fetchPages(currentPage);
    } catch (err) {
      alert("Failed to delete page.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CMS Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's paginated content structure.</p>
        </div>
        <Link 
          href="/admin/pages/create" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all font-medium"
        >
          + Create New Page
        </Link>
      </div>

      <PaginatedTable
        headers={['Title & Slug', 'Status', 'Author', 'Date Created', 'Actions']}
        loading={loading}
        error={error}
        isEmpty={pages.length === 0}
        emptyMessage="No pages published yet."
        emptySubtext="Scale seamlessly into reality."
        meta={meta}
        onPageChange={setCurrentPage}
      >
        {pages.map((page) => (
          <tr key={page.id} className="hover:bg-blue-50/50 transition-colors group">
            <td className="p-5">
              <div className="font-semibold text-gray-900">{page.title}</div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">/{page.slug}</div>
            </td>
            <td className="p-5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                page.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {page.status}
              </span>
            </td>
            <td className="p-5 text-gray-600 text-sm font-medium">{page.author?.email || 'Unknown'}</td>
            <td className="p-5 text-gray-500 text-sm font-medium">
              {new Date(page.created_at).toLocaleDateString()}
            </td>
            <td className="p-5 text-right space-x-4">
              <Link href={`/admin/pages/${page.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">
                Edit
              </Link>
              <button 
                onClick={() => handleDelete(page.id)}
                className="text-red-500 hover:text-red-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </PaginatedTable>
    </div>
  );
}
