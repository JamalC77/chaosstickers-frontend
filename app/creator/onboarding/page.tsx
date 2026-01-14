'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionToken, getStoredCreator, checkStoreName, authenticatedFetch, setStoredCreator } from '../../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

export default function CreatorOnboarding() {
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [storeNameStatus, setStoreNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [storeNameError, setStoreNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      router.push('/creator/signup');
      return;
    }

    const creator = getStoredCreator();
    if (creator && !creator.storeName.startsWith('creator-')) {
      // Already onboarded
      router.push('/creator/dashboard');
    }
  }, [router]);

  // Debounced store name check
  useEffect(() => {
    if (!storeName || storeName.length < 3) {
      setStoreNameStatus('idle');
      return;
    }

    const validateStoreName = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(storeName) ||
                             (storeName.length >= 2 && /^[a-z0-9]+$/.test(storeName));

    if (!validateStoreName) {
      setStoreNameStatus('invalid');
      setStoreNameError('Use lowercase letters, numbers, and hyphens only');
      return;
    }

    setStoreNameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const result = await checkStoreName(storeName);
        if (result.available) {
          setStoreNameStatus('available');
          setStoreNameError('');
        } else {
          setStoreNameStatus('taken');
          setStoreNameError(result.error || 'This name is taken');
        }
      } catch {
        setStoreNameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [storeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (storeNameStatus !== 'available') {
      setError('Please choose an available store name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${API_BASE}/api/creators/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, storeName, bio }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      setStoredCreator(data.creator);
      router.push('/creator/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Set up your creator profile
            </h1>
            <p className="text-gray-600">
              This is how fans will find and recognize you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or brand"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                Store URL
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  chaosstickers.com/shop/
                </span>
                <input
                  type="text"
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-store"
                  required
                  minLength={3}
                  maxLength={30}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="mt-1 h-5">
                {storeNameStatus === 'checking' && (
                  <p className="text-sm text-gray-500">Checking availability...</p>
                )}
                {storeNameStatus === 'available' && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Available!
                  </p>
                )}
                {(storeNameStatus === 'taken' || storeNameStatus === 'invalid') && (
                  <p className="text-sm text-red-600">{storeNameError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell fans a bit about yourself and your art..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">{bio.length}/500</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || storeNameStatus !== 'available'}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </span>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
