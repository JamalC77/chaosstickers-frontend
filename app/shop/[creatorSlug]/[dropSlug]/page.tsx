'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

interface Design {
  id: number;
  imageId: number;
  displayOrder: number;
  isHero: boolean;
  image: {
    id: number;
    imageUrl: string;
    noBackgroundUrl: string | null;
    prompt: string;
  };
}

interface Pack {
  id: number;
  type: string;
  name: string;
  description: string | null;
  designCount: number;
  priceInCents: number;
  isDefault: boolean;
}

interface Drop {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  publishedAt: string;
  creator: {
    id: number;
    name: string | null;
    storeName: string;
    profileImageUrl: string | null;
    bio: string | null;
    isVerified: boolean;
  };
  designs: Design[];
  packs: Pack[];
}

export default function DropPage() {
  const params = useParams();
  const router = useRouter();
  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesigns, setSelectedDesigns] = useState<number[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  useEffect(() => {
    const loadDrop = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/shop/drops/${params.creatorSlug}/${params.dropSlug}`
        );
        if (response.ok) {
          const data = await response.json();
          setDrop(data.drop);
          // Auto-select default pack
          const defaultPack = data.drop.packs.find((p: Pack) => p.isDefault);
          if (defaultPack) {
            setSelectedPack(defaultPack);
          }
        }
      } catch (error) {
        console.error('Error loading drop:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrop();
  }, [params.creatorSlug, params.dropSlug]);

  const toggleDesign = (imageId: number) => {
    if (!selectedPack || selectedPack.type !== 'BUILD_A_PACK') return;

    setSelectedDesigns(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      }
      if (prev.length >= selectedPack.designCount) {
        return prev; // Max reached
      }
      return [...prev, imageId];
    });
  };

  const handleCheckout = () => {
    if (!drop || !selectedPack) return;

    // For BUILD_A_PACK, validate selection count
    if (selectedPack.type === 'BUILD_A_PACK' && selectedDesigns.length !== selectedPack.designCount) {
      alert(`Please select ${selectedPack.designCount} stickers`);
      return;
    }

    // Store checkout data
    localStorage.setItem('packCheckout', JSON.stringify({
      dropId: drop.id,
      packId: selectedPack.id,
      selectedDesignIds: selectedPack.type === 'BUILD_A_PACK' ? selectedDesigns : [],
      creatorSlug: params.creatorSlug,
      dropSlug: params.dropSlug,
    }));

    router.push(`/shop/${params.creatorSlug}/${params.dropSlug}/checkout`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!drop) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drop not found</h1>
          <Link href="/shop" className="text-purple-600 hover:text-purple-700">
            Browse all drops
          </Link>
        </div>
      </main>
    );
  }

  const heroImage = drop.designs.find(d => d.isHero)?.image || drop.designs[0]?.image;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Hero Image */}
            <div className="md:w-1/3">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                {heroImage ? (
                  <img
                    src={heroImage.noBackgroundUrl || heroImage.imageUrl}
                    alt={drop.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Drop Info */}
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{drop.title}</h1>

              {/* Creator */}
              <Link
                href={`/shop/${drop.creator.storeName}`}
                className="flex items-center gap-3 mb-4 group"
              >
                {drop.creator.profileImageUrl ? (
                  <img
                    src={drop.creator.profileImageUrl}
                    alt={drop.creator.name || drop.creator.storeName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-lg text-purple-600 font-medium">
                      {(drop.creator.name || drop.creator.storeName).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 group-hover:text-purple-600">
                      {drop.creator.name || drop.creator.storeName}
                    </span>
                    {drop.creator.isVerified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">View all drops</span>
                </div>
              </Link>

              {drop.description && (
                <p className="text-gray-600 mb-6">{drop.description}</p>
              )}

              <p className="text-lg font-medium text-gray-900 mb-2">
                {drop.designs.length} stickers in this drop
              </p>

              {/* Pack Selection */}
              <div className="space-y-3 mb-6">
                {drop.packs.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => {
                      setSelectedPack(pack);
                      setSelectedDesigns([]);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedPack?.id === pack.id
                        ? 'bg-purple-50 border-2 border-purple-600'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{pack.name}</h4>
                        <p className="text-sm text-gray-500">{pack.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ${(pack.priceInCents / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(pack.priceInCents / pack.designCount / 100).toFixed(2)}/sticker
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticker Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPack?.type === 'BUILD_A_PACK' && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900">
                Select {selectedPack.designCount} stickers for your pack
              </p>
              <p className="text-sm text-purple-700">
                {selectedDesigns.length} of {selectedPack.designCount} selected
              </p>
            </div>
            <div className="w-32 h-2 bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${(selectedDesigns.length / selectedPack.designCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {drop.designs.map((design) => (
            <div
              key={design.id}
              onClick={() => toggleDesign(design.image.id)}
              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                selectedPack?.type === 'BUILD_A_PACK'
                  ? selectedDesigns.includes(design.image.id)
                    ? 'ring-4 ring-purple-600 ring-offset-2'
                    : 'hover:ring-2 hover:ring-purple-300'
                  : ''
              }`}
            >
              <img
                src={design.image.noBackgroundUrl || design.image.imageUrl}
                alt={design.image.prompt}
                className="w-full h-full object-cover"
              />
              {selectedPack?.type === 'BUILD_A_PACK' && selectedDesigns.includes(design.image.id) && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Checkout Bar */}
      {selectedPack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{selectedPack.name}</p>
              <p className="text-2xl font-bold text-purple-600">
                ${(selectedPack.priceInCents / 100).toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={
                selectedPack.type === 'BUILD_A_PACK' &&
                selectedDesigns.length !== selectedPack.designCount
              }
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {selectedPack.type === 'BUILD_A_PACK' &&
              selectedDesigns.length !== selectedPack.designCount
                ? `Select ${selectedPack.designCount - selectedDesigns.length} more`
                : 'Continue to Checkout'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
