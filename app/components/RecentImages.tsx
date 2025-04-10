'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Interface for images fetched from DB
interface GeneratedImage {
  id: number;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

// Interface for items stored in the cart (localStorage)
// TODO: Move to a shared types file
interface CheckoutItem {
  id: number; // Using imageUrl as ID for cart items
  imageUrl: string;
  quantity: number;
}

export default function RecentImages() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartImageUrls, setCartImageUrls] = useState<Set<string>>(new Set()); // State for cart items
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/generate-image/recent`, {
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

  const updateCartState = () => {
    if (typeof window !== 'undefined') {
        const storedItemsString = localStorage.getItem('checkoutItems');
        const currentCartUrls = new Set<string>();
        if (storedItemsString) {
            try {
                const parsedItems: CheckoutItem[] = JSON.parse(storedItemsString);
                if (Array.isArray(parsedItems)) {
                    parsedItems.forEach(item => item.imageUrl && currentCartUrls.add(item.imageUrl));
                }
            } catch (error) {
                console.error('Failed to parse checkoutItems for RecentImages:', error);
            }
        }
        setCartImageUrls(currentCartUrls);
    }
  };

  useEffect(() => {
    updateCartState(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'checkoutItems') {
        updateCartState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addToCart = (image: GeneratedImage) => {
    const newItem: CheckoutItem = {
        id: image.id, // Use imageUrl as the unique ID for the cart item
        imageUrl: image.imageUrl,
        quantity: 1,
    };

    let existingItems: CheckoutItem[] = [];
    const storedItemsString = localStorage.getItem('checkoutItems');
    if (storedItemsString) {
        try {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed)) {
                existingItems = parsed.filter(item => item && item.id && item.imageUrl);
            }
        } catch (e) { console.error("Error parsing cart for add:", e); }
    }

    if (!existingItems.some(item => item.id === newItem.id)) {
        const updatedItems = [...existingItems, newItem];
        try {
            localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
            updateCartState();
            window.dispatchEvent(new Event('storage'));
        } catch (e) { console.error("Error saving cart:", e); }
    } else {
        console.log("Item already in cart:", newItem.id);
    }
  };

  const removeFromCart = (imageUrlToRemove: string) => {
    let existingItems: CheckoutItem[] = [];
    const storedItemsString = localStorage.getItem('checkoutItems');
     if (storedItemsString) {
        try {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed)) {
                existingItems = parsed.filter(item => item && item.id && item.imageUrl);
            }
        } catch (e) { console.error("Error parsing cart for remove:", e); }
    }

    const updatedItems = existingItems.filter(item => item.id !== imageUrlToRemove);

    try {
        localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
        updateCartState();
        window.dispatchEvent(new Event('storage'));
    } catch (e) { console.error("Error saving cart after remove:", e); }
  };

  const handleImageClick = (image: GeneratedImage) => {
    // Store data needed for the design page
    localStorage.setItem('userPrompt', image.prompt);
    localStorage.setItem('generatedImageUrl', image.imageUrl);
    localStorage.removeItem('generatedImageId');
    localStorage.removeItem('hasRemovedBackground');
    
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
        {images.map((image) => {
          const isInCart = cartImageUrls.has(image.imageUrl);
          return (
            <div key={image.id} className="relative group">
              <div 
                className="aspect-square relative overflow-hidden rounded-lg border border-purple-200 bg-white/50 cursor-pointer" 
                onClick={() => handleImageClick(image)}
              >
                <Image 
                  src={image.imageUrl} 
                  alt={image.prompt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 backdrop-blur-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-white truncate">{image.prompt}</p>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                {isInCart ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(image.imageUrl);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                  >
                    Remove from Cart
                  </button>
                ) : (
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        addToCart(image);
                     }}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 