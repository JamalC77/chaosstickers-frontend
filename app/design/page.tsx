'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DesignPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const router = useRouter();
  const apiCallMade = useRef(false);

  console.log('DesignPage component rendering');

  useEffect(() => {
    // Get or create userId
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    console.log('DesignPage useEffect running, apiCallMade:', apiCallMade.current);
    
    const controller = new AbortController();
    
    // Get the prompt from localStorage
    const storedPrompt = localStorage.getItem('userPrompt');
    if (!storedPrompt) {
      router.push('/');
      return;
    }

    setPrompt(storedPrompt);
    
    // Check if we already have an image URL for this prompt
    const storedImageUrl = localStorage.getItem('generatedImageUrl');
    const storedImageId = localStorage.getItem('generatedImageId');
    
    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
      setLoading(false);
      apiCallMade.current = true; // Mark as handled so we don't regenerate
      
      if (storedImageId) {
        setImageId(storedImageId);
      }
    } else if (userId) {
      // Only generate if we have a userId and haven't made the API call already
      console.log('Making API call to generate image');
      generateImage(storedPrompt, controller.signal);
      apiCallMade.current = true;
    }
    
    // Cleanup function
    return () => {
      console.log('DesignPage cleanup running');
      controller.abort();
    };
  }, [userId, router]);

  const generateImage = async (promptText: string, signal?: AbortSignal, forceRegenerate: boolean = false) => {
    // Don't regenerate if we're already loading
    if (loading && imageUrl && !forceRegenerate) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('Calling backend API to generate image...');
      // Call the backend API to generate the image
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3001'}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ 
          prompt: promptText,
          timestamp: Date.now(), // Add timestamp to prevent caching
          regenerate: forceRegenerate,
          userId: userId // Include userId to associate with the generated image
        }),
        signal,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Image generated successfully (full response):', data);
      setImageUrl(data.imageUrl);
      
      // Save the image ID if available
      if (data.id) {
        console.log('Image ID received:', data.id);
        setImageId(data.id);
        console.log('Attempting to save imageId to localStorage:', data.id);
        localStorage.setItem('generatedImageId', data.id);
        console.log('localStorage after setting imageId:', localStorage.getItem('generatedImageId'));
      } else {
        console.warn('No image ID (data.id) received from backend in response:', data);
      }
      
      // Store the imageUrl in localStorage to use it on the checkout page
      localStorage.setItem('generatedImageUrl', data.imageUrl);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name !== 'AbortError') {
        console.error('Error generating image:', err);
        setError('Failed to generate image. Please try again.');
        
        // For demo purposes, set a placeholder image
        setImageUrl('https://placehold.co/600x600/gray/white?text=Image+Generation+Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Clear the stored image URL from localStorage
    localStorage.removeItem('generatedImageUrl');
    localStorage.removeItem('generatedImageId');
    localStorage.removeItem('hasRemovedBackground');
    apiCallMade.current = false;
    setImageUrl(''); // Clear the current image
    setImageId(null); // Clear the image ID
    generateImage(prompt, undefined, true); // Force regeneration
  };

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl z-10 backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-2xl border border-white/60">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">Your Design</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-purple-200/50 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            <p className="mt-6 text-lg font-medium text-purple-800">Crafting your masterpiece...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-red-200/50 rounded-lg bg-white/50 backdrop-blur-sm">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={handleRegenerate}
              className="art-button mt-6 py-3 px-6 rounded-xl text-white font-bold focus:outline-none"
            >
              <span className="relative z-10">Try Again</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative h-[400px] w-full border-2 border-purple-200/50 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Generated sticker design"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4">
                <button
                  onClick={handleRegenerate}
                  className="py-3 px-6 bg-white/70 backdrop-blur-sm text-purple-800 font-bold rounded-xl hover:bg-white/90 transition-all duration-300 hover:shadow-lg flex-1 border border-purple-200"
                >
                  Reimagine the Sticker? ✨
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="art-button py-3 px-6 rounded-xl text-white font-bold focus:outline-none flex-1"
                >
                  <span className="relative z-10">Continue to Checkout</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3 text-purple-800">Your Creative Prompt:</h2>
          <p className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200/50 shadow-md">{prompt}</p>
        </div>
      </div>
    </main>
  );
} 