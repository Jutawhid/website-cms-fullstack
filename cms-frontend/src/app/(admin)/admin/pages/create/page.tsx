"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'draft',
    content: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // 💡 MENTOR TIP: We auto-generate the slug magically from the title as the user Types!
    if (e.target.name === 'title') {
      const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, title: e.target.value, slug: autoSlug });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Magically POST to our Golang Database handler
      await api.post('/api/v1/pages', formData);
      router.push('/admin/pages'); // Redirect dynamically to the table
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to critically create page");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/pages" className="text-gray-500 hover:text-gray-700 font-medium">
          ← Back to Table
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New CMS Page</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
            <input 
              type="text" name="title" required
              value={formData.title} onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Welcome to my Blog"
            />
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
            <input 
              type="text" name="slug" required
              value={formData.slug} onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-mono text-sm text-gray-600 transition-all"
              placeholder="e.g. welcome-to-my-blog"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Publish Status</label>
          <select 
            name="status" 
            value={formData.status} onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
          >
            <option value="draft">Draft (Hidden)</option>
            <option value="published">Published (Live)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Page Content (HTML/Markdown)</label>
          <textarea 
            name="content" required rows={14}
            value={formData.content} onChange={handleChange}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed transition-all resize-y"
            placeholder="# Write your magnificent content here..."
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {loading ? "Saving intelligently..." : "Publish Page"}
          </button>
        </div>
      </form>
    </div>
  );
}
