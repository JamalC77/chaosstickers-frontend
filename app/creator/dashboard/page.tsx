'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken, getCurrentCreator, logout, authenticatedFetch, Creator } from '../../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

interface Drop {
  id: number;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  heroImage: { imageUrl: string; noBackgroundUrl: string | null } | null;
  _count: { designs: number; orders: number };
}

interface Analytics {
  drops: { total: number; published: number; draft: number };
  designs: { total: number };
  orders: { total: number };
  earnings: { totalGross: number; totalPayout: number };
}

export default function CreatorDashboard() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const token = getSessionToken();
      if (!token) {
        router.push('/creator/signup');
        return;
      }

      try {
        // Fetch creator info
        const creatorData = await getCurrentCreator();
        if (!creatorData) {
          router.push('/creator/signup');
          return;
        }

        // Check if needs onboarding
        if (creatorData.storeName.startsWith('creator-')) {
          router.push('/creator/onboarding');
          return;
        }

        setCreator(creatorData);

        // Fetch drops and analytics in parallel
        const [dropsRes, analyticsRes] = await Promise.all([
          authenticatedFetch(`${API_BASE}/api/drops`),
          authenticatedFetch(`${API_BASE}/api/creators/me/analytics`),
        ]);

        if (dropsRes.ok) {
          const dropsData = await dropsRes.json();
          setDrops(dropsData.drops || []);
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData.analytics);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {creator?.name || creator?.storeName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/shop/${creator?.storeName}`}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                target="_blank"
              >
                View store →
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Drops</p>
            <p className="text-3xl font-bold text-gray-900">{analytics?.drops.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Published</p>
            <p className="text-3xl font-bold text-green-600">{analytics?.drops.published || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{analytics?.orders.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Earnings</p>
            <p className="text-3xl font-bold text-purple-600">
              ${((analytics?.earnings.totalPayout || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Create Drop CTA */}
        <div className="mb-8">
          <Link
            href="/creator/drops/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Drop
          </Link>
        </div>

        {/* Drops List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Your Drops</h2>
          </div>

          {drops.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No drops yet</h3>
              <p className="text-gray-500 mb-6">Create your first sticker drop and start selling!</p>
              <Link
                href="/creator/drops/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create your first drop
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {drops.map((drop) => (
                <Link
                  key={drop.id}
                  href={`/creator/drops/${drop.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {drop.heroImage ? (
                      <img
                        src={drop.heroImage.noBackgroundUrl || drop.heroImage.imageUrl}
                        alt={drop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{drop.title}</h3>
                    <p className="text-sm text-gray-500">
                      {drop._count.designs} designs · {drop._count.orders} orders
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        drop.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : drop.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {drop.status.toLowerCase()}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
