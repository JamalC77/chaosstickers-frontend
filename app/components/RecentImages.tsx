'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface GeneratedImage {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function RecentImages() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  console.log('RecentImages component rendering');

  useEffect(() => {
    console.log('RecentImages useEffect running');
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchRecentImages = async () => {
      console.log('fetchRecentImages starting');
      try {
        const response = await fetch('http://localhost:3001/api/generate-image/recent', {
          signal,
          // Add cache: 'no-store' to prevent caching
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch recent images');
        }
        const data = await response.json();
        console.log('fetchRecentImages data received:', data.length);
        if (isMounted) {
          setImages(data);
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name !== 'AbortError') {
          console.error('Error fetching recent images:', err);
          if (isMounted) {
            setError('Failed to load recent designs');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecentImages();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log('RecentImages cleanup running');
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleImageClick = (image: GeneratedImage) => {
    // Store data needed for the design page
    localStorage.setItem('userPrompt', image.prompt);
    localStorage.setItem('generatedImageUrl', image.imageUrl);
    
    // Navigate to the design page
    router.push('/design');
  };

  if (loading) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Recent Designs</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Recent Designs</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Recent Designs</h3>
        <p className="text-sm text-gray-600">No designs created yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-purple-800 mb-4">Recent Designs</h3>
      <div className="grid grid-cols-2 gap-3">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-square relative overflow-hidden rounded-lg border border-purple-200 bg-white/50">
              <Image 
                src={image.imageUrl} 
                alt={image.prompt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 backdrop-blur-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-xs text-white truncate">{image.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 