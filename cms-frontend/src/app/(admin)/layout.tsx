"use client";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 tracking-tight">
          CMS Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block p-3 rounded-lg hover:bg-gray-800 transition-all font-medium">
            Dashboard
          </Link>
          <Link href="/admin/pages" className="block p-3 rounded-lg hover:bg-gray-800 transition-all font-medium">
            Pages (CMS)
          </Link>
          <Link href="/admin/media" className="block p-3 rounded-lg hover:bg-gray-800 transition-all font-medium">
            Media Library
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            className="w-full text-left p-3 text-red-400 hover:bg-gray-800 rounded-lg transition-all font-medium"
            onClick={() => {
              typeof window !== 'undefined' && localStorage.removeItem('access_token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
