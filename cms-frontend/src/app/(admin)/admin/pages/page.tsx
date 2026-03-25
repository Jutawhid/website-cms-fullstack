"use client";
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

// Interface matching our Golang models.Page blueprint
interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  author: {
    email: string;
  };
}

export default function PagesTable() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to hit the highly secure GET /api/v1/pages endpoint
    const fetchPages = async () => {
      try {
        const response = await api.get('/api/v1/pages');
        setPages(response.data);
      } catch (err: any) {
        console.error("Failed to fetch pages:", err);
        setError("Failed to load CMS pages.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this page?")) return;
    
    try {
      await api.delete(`/api/v1/pages/${id}`);
      // Remove it functionally from the UI instantly
      setPages(pages.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete page.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your website's content dynamically.</p>
        </div>
        <Link 
          href="/admin/pages/create" 
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
        >
          + Create New Page
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-100 rounded w-full"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pages found.</p>
            <p className="text-gray-400 text-sm mt-2">Click the create button above to write your first post!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-4 font-semibold border-b">Title & Slug</th>
                  <th className="p-4 font-semibold border-b">Status</th>
                  <th className="p-4 font-semibold border-b">Author</th>
                  <th className="p-4 font-semibold border-b">Date Created</th>
                  <th className="p-4 font-semibold border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {page.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{page.author?.email || 'Unknown'}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(page.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link href={`/admin/pages/${page.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(page.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
