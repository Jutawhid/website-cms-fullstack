"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/api/v1/auth/login', { email, password });
            const { access_token, user } = response.data;
            
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user_role', user.role);
            
            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="w-96 rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">CMS Login</h2>
                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        required 
                        className="mt-1 w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type="password" 
                        required 
                        className="mt-1 w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
                
                <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors">
                    Sign In
                </button>
            </form>
        </div>
    );
}
