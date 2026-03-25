"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [user, setUser] = useState<{ id: string, role: string } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Attempt to hit the protected Golang endpoint using our global Axios interceptor token!
    const fetchUserAndVerifyAuth = async () => {
      try {
        const res = await api.get('/api/v1/auth/me');
        setUser(res.data);
      } catch (err: any) {
        console.error("Auth Request Failed:", err);
        setError("Unauthorized. Redirecting to login...");
        
        // 1. Wipe invalid tokens from the browser
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        
        // 2. Redirect mathematically to the login page immediately
        router.push('/login');
      }
    };
    
    fetchUserAndVerifyAuth();
  }, [router]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Your dynamic content overview and statistics sit here.
      </p>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          ⚠️ {error} - Please go back to /login
        </div>
      ) : user ? (
        <div className="group p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl max-w-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user.role.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="block font-bold text-blue-900">Successfully Authenticated</span>
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
          <p className="text-xs text-blue-400 mt-4 break-all opacity-0 group-hover:opacity-100 transition-opacity">
            UUID: {user.id}
          </p>
        </div>
      ) : (
        <div className="animate-pulse flex space-x-4 max-w-sm p-6 border rounded-xl">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
