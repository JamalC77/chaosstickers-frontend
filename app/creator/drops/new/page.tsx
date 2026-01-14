'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionToken, authenticatedFetch } from '../../../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_BASE_API_URL || '';

type Step = 'info' | 'designs' | 'packs' | 'review';

interface GeneratedImage {
  id: number;
  prompt: string;
  imageUrl: string;
  noBackgroundUrl: string | null;
  createdAt: string;
}

export default function NewDropPage() {
  const [step, setStep] = useState<Step>('info');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dropId, setDropId] = useState<number | null>(null);
  const [availableImages, setAvailableImages] = useState<GeneratedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [heroImageId, setHeroImageId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      router.push('/creator/signup');
      return;
    }
    loadImages();
  }, [router]);

  const loadImages = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/api/creators/me/images?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAvailableImages(data.images || []);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleCreateDrop = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your drop');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${API_BASE}/api/drops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create drop');
      }

      const data = await response.json();
      setDropId(data.drop.id);
      setStep('designs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDesign = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Generate image via the existing generate endpoint
      const response = await fetch(`${API_BASE}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, creatorMode: true }),
      });

      if (response.ok) {
        const data = await response.json();
        // Reload images to include the new one
        await loadImages();
        setPrompt('');
      }
    } catch (error) {
      console.error('Error generating design:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleAddDesignsToDrop = async () => {
    if (!dropId || selectedImages.length === 0) {
      setError('Please select at least one design');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Add each selected image to the drop
      for (let i = 0; i < selectedImages.length; i++) {
        const imageId = selectedImages[i];
        const isHero = imageId === heroImageId || (heroImageId === null && i === 0);

        await authenticatedFetch(`${API_BASE}/api/drops/${dropId}/designs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, isHero }),
        });
      }

      setStep('packs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDefaultPacks = async () => {
    if (!dropId) return;

    setIsLoading(true);
    setError('');

    try {
      // Create Build-a-Pack of 6
      await authenticatedFetch(`${API_BASE}/api/drops/${dropId}/packs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BUILD_A_PACK',
          name: 'Pick 6 Pack',
          description: 'Choose any 6 stickers from this drop',
          designCount: 6,
          priceInCents: 1680, // $2.80 x 6
          isDefault: true,
        }),
      });

      // Create Full Set pack if enough designs
      if (selectedImages.length >= 6) {
        await authenticatedFetch(`${API_BASE}/api/drops/${dropId}/packs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'FULL_SET',
            name: 'Complete Collection',
            description: `All ${selectedImages.length} stickers from this drop`,
            designCount: selectedImages.length,
            priceInCents: selectedImages.length * 250, // $2.50 each
            isDefault: false,
          }),
        });
      }

      setStep('review');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!dropId) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${API_BASE}/api/drops/${dropId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details?.join(', ') || data.error || 'Failed to publish');
      }

      router.push('/creator/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'info', label: 'Drop Info' },
    { key: 'designs', label: 'Designs' },
    { key: 'packs', label: 'Packs' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/creator/dashboard" className="text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Create New Drop</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    index <= currentStepIndex ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step: Info */}
        {step === 'info' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Name your drop</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Drop Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Vibes Collection"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell fans about this drop..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <button
                onClick={handleCreateDrop}
                disabled={isLoading || !title.trim()}
                className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Creating...' : 'Continue to Designs'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Designs */}
        {step === 'designs' && (
          <div className="space-y-6">
            {/* Generate New Design */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Generate a new design</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your sticker idea..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleGenerateDesign}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Select Designs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Select designs for your drop</h3>
                <span className="text-sm text-gray-500">
                  {selectedImages.length} selected (min 3 recommended)
                </span>
              </div>

              {availableImages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No designs yet. Generate some designs above!
                </p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {availableImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => toggleImageSelection(image.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImages.includes(image.id)
                          ? 'border-purple-600 ring-2 ring-purple-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.noBackgroundUrl || image.imageUrl}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      {selectedImages.includes(image.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {heroImageId === image.id && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-xs font-medium rounded">
                          Hero
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select hero image (featured on drop page)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedImages.map((id) => {
                      const img = availableImages.find(i => i.id === id);
                      return img ? (
                        <button
                          key={id}
                          onClick={() => setHeroImageId(id === heroImageId ? null : id)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                            heroImageId === id ? 'border-yellow-500' : 'border-transparent'
                          }`}
                        >
                          <img src={img.noBackgroundUrl || img.imageUrl} alt="" className="w-full h-full object-cover" />
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddDesignsToDrop}
                disabled={isLoading || selectedImages.length < 1}
                className="mt-6 w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Adding designs...' : `Continue with ${selectedImages.length} designs`}
              </button>
            </div>
          </div>
        )}

        {/* Step: Packs */}
        {step === 'packs' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure packs</h2>
            <p className="text-gray-600 mb-6">
              Packs encourage fans to buy more stickers. We'll set up recommended pack options for you.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">6</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pick 6 Pack</h4>
                    <p className="text-sm text-gray-600">Fans choose any 6 stickers - $16.80 ($2.80 each)</p>
                  </div>
                  <span className="ml-auto px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">Default</span>
                </div>
              </div>

              {selectedImages.length >= 6 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">All</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Complete Collection</h4>
                      <p className="text-sm text-gray-600">
                        All {selectedImages.length} stickers - ${((selectedImages.length * 250) / 100).toFixed(2)} ($2.50 each)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCreateDefaultPacks}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Setting up packs...' : 'Continue to Review'}
            </button>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to publish?</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Drop title: <strong>{title}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{selectedImages.length} designs added</span>
              </div>
              <div className="flex items-center gap-3 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Pack options configured</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/creator/dashboard')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Publishing...' : 'Publish Drop'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
