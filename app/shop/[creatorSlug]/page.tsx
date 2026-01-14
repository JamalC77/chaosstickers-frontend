'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

interface Drop {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  _count: { designs: number };
}

interface Creator {
  id: number;
  name: string | null;
  storeName: string;
  bio: string | null;
  profileImageUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  drops: Drop[];
}

export default function CreatorStorePage() {
  const params = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCreator = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/creators/${params.creatorSlug}`);
        if (response.ok) {
          const data = await response.json();
          setCreator(data.creator);
        }
      } catch (error) {
        console.error('Error loading creator:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreator();
  }, [params.creatorSlug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator not found</h1>
          <Link href="/shop" className="text-purple-600 hover:text-purple-700">
            Browse all drops
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Creator Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            {creator.profileImageUrl ? (
              <img
                src={creator.profileImageUrl}
                alt={creator.name || creator.storeName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-5xl text-white font-bold">
                  {(creator.name || creator.storeName).charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Creator Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {creator.name || creator.storeName}
                </h1>
                {creator.isVerified && (
                  <svg className="w-7 h-7 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {creator.bio && (
                <p className="text-white/90 text-lg max-w-xl">{creator.bio}</p>
              )}
              <p className="text-white/70 mt-2">
                {creator.drops.length} drop{creator.drops.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Sticker Drops</h2>

        {creator.drops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500">No drops published yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creator.drops.map((drop) => (
              <Link
                key={drop.id}
                href={`/shop/${creator.storeName}/${drop.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Cover Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {drop.coverImageUrl ? (
                    <img
                      src={drop.coverImageUrl}
                      alt={drop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{drop.title}</h3>
                  {drop.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{drop.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{drop._count.designs} stickers</span>
                    <span className="text-purple-600 font-medium group-hover:text-purple-700">
                      View drop →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
