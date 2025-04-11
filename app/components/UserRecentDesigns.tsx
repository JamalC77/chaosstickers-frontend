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
    // Add type assertion to ensure GeneratedImage includes the needed props
    const fullImage = image as GeneratedImage & { noBackgroundUrl?: string | null, hasRemovedBackground?: boolean };

    localStorage.setItem('userPrompt', fullImage.prompt);
    localStorage.setItem('generatedImageUrl', fullImage.imageUrl);
    localStorage.setItem('generatedImageId', fullImage.id.toString());
    
    // Store background removal info
    if (fullImage.noBackgroundUrl) {
      localStorage.setItem('noBackgroundUrl', fullImage.noBackgroundUrl);
    } else {
      localStorage.removeItem('noBackgroundUrl'); // Ensure it's removed if null
    }
    localStorage.setItem('hasRemovedBackground', fullImage.hasRemovedBackground ? 'true' : 'false');

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

              {/* --- Cart Action Overlay --- */}
              {/* Mobile: Always visible icons bottom-right. Desktop: Centered text buttons on hover */}
              <div className="absolute bottom-2 right-2 p-1 rounded-full bg-black/50 
                             md:inset-0 md:flex md:items-center md:justify-center md:p-4 md:bg-black/50 
                             opacity-100 md:opacity-0 md:group-hover:opacity-100 
                             transition-opacity duration-300 pointer-events-none md:rounded-lg">
                 
                 {/* Container for actual interactive elements */}
                 <div className="pointer-events-auto">
                    {isInCart ? (
                      <>
                        {/* Mobile Remove Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(image.id); 
                          }}
                          className="md:hidden p-1 text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-black/50"
                          aria-label={`Remove ${image.prompt} from cart`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      
                        {/* Desktop Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); 
                            removeFromCart(image.id); 
                          }}
                          className="hidden md:inline-block bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                          aria-label={`Remove ${image.prompt} from cart`}
                        >
                          Remove from Cart
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Mobile Add Icon */}
                         <button
                           onClick={(e) => {
                              e.stopPropagation(); 
                              addToCart(image); 
                           }}
                          className="md:hidden p-1 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-black/50"
                          aria-label={`Add ${image.prompt} to cart`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                           </svg>
                         </button>

                        {/* Desktop Add Button */}
                        <button
                           onClick={(e) => {
                              e.stopPropagation(); 
                              addToCart(image); 
                           }}
                          className="hidden md:inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1 px-3 rounded-full shadow transition-colors"
                          aria-label={`Add ${image.prompt} to cart`}
                        >
                          Add to Cart
                        </button>
                      </>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 