'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Interface for images fetched from DB
interface GeneratedImage {
  id: number; // DB ID
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

// Interface for items stored in the cart (localStorage)
// Uses numeric ID
interface CheckoutItem {
  id: number; // Use DB ID (number)
  imageUrl: string;
  quantity: number;
}

export default function UserRecentDesigns() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  // State now tracks numeric IDs
  const [cartItemIds, setCartItemIds] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    // Generate or retrieve user ID from localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Generate a new UUID
      const newUserId = crypto.randomUUID();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we have a userId
    if (!userId) return;
    
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchUserImages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/generate-image/user/${userId}`, {
          signal,
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch your designs');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setImages(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name !== 'AbortError') {
          console.error('Error fetching user designs:', err);
          if (isMounted) {
            setError('Failed to load your designs');
            setLoading(false);
          }
        }
      }
    };

    fetchUserImages();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  // Updates the state tracking which items (by numeric ID) are in the cart
  const updateCartState = () => {
    if (typeof window !== 'undefined') {
        const storedItemsString = localStorage.getItem('checkoutItems');
        const currentCartIds = new Set<number>(); // Use Set<number>
        if (storedItemsString) {
            try {
                // Ensure parsed items match the updated CheckoutItem interface
                const parsedItems: CheckoutItem[] = JSON.parse(storedItemsString);
                if (Array.isArray(parsedItems)) {
                    // Add the numeric id to the set
                    parsedItems.forEach(item => {
                        if (item && typeof item.id === 'number') { // Check if id is a number
                           currentCartIds.add(item.id);
                        } else {
                            console.warn("Parsed item with non-numeric ID found:", item);
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to parse checkoutItems for UserRecentDesigns state update:', error);
            }
        }
        setCartItemIds(currentCartIds); // Update state with numeric IDs
    }
  };

  // Effect to load cart state initially and listen for changes
  useEffect(() => {
    updateCartState(); // Initial load

    // Listen for storage changes specifically for checkoutItems
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'checkoutItems') {
        console.log("Detected storage change for checkoutItems, updating cart state.");
        updateCartState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Adds an item to the cart using its numeric ID
  const addToCart = (image: GeneratedImage) => {
    // Ensure CheckoutItem uses numeric id
    const newItem: CheckoutItem = {
        id: image.id, // Use numeric DB ID
        imageUrl: image.imageUrl,
        quantity: 1,
    };

    let existingItems: CheckoutItem[] = [];
    const storedItemsString = localStorage.getItem('checkoutItems');
    if (storedItemsString) {
        try {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed)) {
                // Ensure items being filtered/parsed have numeric id
                existingItems = parsed.filter(item => item && typeof item.id === 'number' && item.imageUrl);
            }
        } catch (e) { console.error("Error parsing cart before adding:", e); }
    }

    // Check if item already exists using numeric ID
    if (!existingItems.some(item => item.id === newItem.id)) {
        const updatedItems = [...existingItems, newItem];
        try {
            console.log("Adding item to cart (ID):", newItem.id);
            localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
            // Manually trigger storage event to ensure navigation/other components update
            window.dispatchEvent(new StorageEvent('storage', { key: 'checkoutItems' }));
        } catch (e) { console.error("Error saving cart after adding:", e); }
    } else {
        console.log("Item already in cart (ID):", newItem.id);
    }
  };

  // Removes an item from the cart using its numeric ID
  const removeFromCart = (imageIdToRemove: number) => { // Parameter is now number
    let existingItems: CheckoutItem[] = [];
    const storedItemsString = localStorage.getItem('checkoutItems');
     if (storedItemsString) {
        try {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed)) {
                 // Ensure items being filtered have numeric id
                existingItems = parsed.filter(item => item && typeof item.id === 'number' && item.imageUrl);
            }
        } catch (e) { console.error("Error parsing cart before removing:", e); }
    }

    // Filter using numeric ID
    const updatedItems = existingItems.filter(item => item.id !== imageIdToRemove);

    // Check if the length actually changed before saving
    if (updatedItems.length !== existingItems.length) {
      try {
          console.log("Removing item from cart (ID):", imageIdToRemove);
          localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
          // updateCartState(); // Let storage event listener handle state update
          // Manually trigger storage event
          window.dispatchEvent(new StorageEvent('storage', { key: 'checkoutItems' }));
      } catch (e) { console.error("Error saving cart after removing:", e); }
    } else {
      console.log("Attempted to remove item not found in cart (ID):", imageIdToRemove);
    }
  };

  // Handles clicking an image - stores info and navigates
  const handleImageClick = (image: GeneratedImage) => {
    localStorage.setItem('userPrompt', image.prompt);
    localStorage.setItem('generatedImageUrl', image.imageUrl);
    localStorage.setItem('generatedImageId', image.id.toString()); // Store numeric ID as string
    localStorage.removeItem('noBackgroundUrl'); // Clean up potentially stale data
    // Note: hasRemovedBackground was deprecated and removed

    router.push('/design');
  };

  if (loading) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Your Recent Designs</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Your Recent Designs</h3>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Your Recent Designs</h3>
        <p className="text-sm text-gray-600">You haven't created any designs yet!</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-purple-800 mb-4">Your Recent Designs</h3>
      <div className="grid grid-cols-2 gap-3">
        {images.map((image) => {
          // Check cart state using numeric ID
          const isInCart = cartItemIds.has(image.id);
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
                      e.stopPropagation(); // Prevent navigation click
                      removeFromCart(image.id); // Use numeric ID
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                    aria-label={`Remove ${image.prompt} from cart`}
                  >
                    Remove from Cart
                  </button>
                ) : (
                  <button
                     onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation click
                        addToCart(image); // Use numeric ID
                     }}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                    aria-label={`Add ${image.prompt} to cart`}
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