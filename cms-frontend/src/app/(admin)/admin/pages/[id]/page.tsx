"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function EditPage() {
  const router = useRouter();
  const params = useParams(); // Extracts the massive UUID securely from the Browser URL
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft',
    content: ''
  });

  // Pull the initial data instantly from Golang!
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.get(`/api/v1/pages/${params.id}`);
        setFormData({
          title: res.data.title,
          slug: res.data.slug,
          status: res.data.status,
          content: res.data.content,
        });
      } catch (err) {
        setError("Failed mathematically to load page data.");
      } finally {
        setFetching(false);
      }
    };
    if (params.id) fetchPage();
  }, [params.id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Notice this is a PUT request natively mapping mapped to Golang UpdateHandler
      await api.put(`/api/v1/pages/${params.id}`, formData);
      router.push('/admin/pages');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to permanently update page");
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="p-12 text-center">
      <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-500 font-medium">Booting CMS Editor Engine...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/pages" className="text-gray-500 hover:text-gray-700 font-medium">← Back to Table</Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit CMS Page</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
            <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-4 focus:ring-indigo-100 outline-none font-mono text-sm transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Publish Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none bg-white cursor-pointer transition-all">
            <option value="draft">Draft (Hidden)</option>
            <option value="published">Published (Live)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Page Content</label>
          <textarea name="content" required rows={12} value={formData.content} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-mono text-sm leading-relaxed transition-all" />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none">
            {loading ? "Updating Server..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
