'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Define CheckoutItem interface (ensure ID is number)
interface CheckoutItem {
  id: number; // <<< MUST be number
  imageUrl: string;
  quantity: number;
}

export default function DesignPage() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // const [imageId, setImageId] = useState<string | null>(null); // Remove this state if it's causing confusion with numeric ID
  const [editablePrompt, setEditablePrompt] = useState('');
  const [useReferenceImage, setUseReferenceImage] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  // State to store details needed for adding to cart and background removal
  // *** THIS IS THE STATE THAT SHOULD HOLD THE NUMERIC DB ID ***
  const [designDetails, setDesignDetails] = useState<{
      id: number | null; // <<< Holds the numeric ID from DB
      originalUrl: string | null;
      noBgUrl: string | null;
      hasRemovedBg: boolean;
   }>({ id: null, originalUrl: null, noBgUrl: null, hasRemovedBg: false });


  const router = useRouter();
  const apiCallMade = useRef(false); // To prevent multiple generations on mount

  // Get or create userId on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) { setUserId(storedUserId); }
    else { const newUserId = crypto.randomUUID(); localStorage.setItem('userId', newUserId); setUserId(newUserId); }
  }, []);

  // --- Load initial design details OR trigger generation based on intent ---
  useEffect(() => {
    console.log('DesignPage: Mount useEffect running...');
    setLoading(true);
    setError(null);

    const intent = localStorage.getItem('designIntent');
    localStorage.removeItem('designIntent'); // Clear the flag
    console.log(`DesignPage: Read intent: '${intent}'`);

    const controller = new AbortController();
    const storedPrompt = localStorage.getItem('userPrompt');

    if (!storedPrompt) {
      console.error("DesignPage: No prompt found.");
      setError("No prompt found. Please start again.");
      setLoading(false);
      return;
    }

    setPrompt(storedPrompt);
    setEditablePrompt(storedPrompt);
    console.log(`DesignPage: Using prompt: "${storedPrompt}"`);

    // --- Decision Logic Based on Intent --- 

    // **Scenario 1: Explicit Intent to Load (or default if no intent specified)**
    if (intent === 'load' || !intent) {
        console.log("DesignPage: Intent is 'load' or missing. Attempting load...");
        const storedImageUrl = localStorage.getItem('generatedImageUrl');
        const storedIdString = localStorage.getItem('generatedImageId');
        const storedNoBgUrl = localStorage.getItem('noBackgroundUrl');
        const storedHasRemovedBg = localStorage.getItem('hasRemovedBackground') === 'true';
        console.log("DesignPage(Load) - localStorage check:", { storedImageUrl, storedIdString });

        if (storedIdString && storedImageUrl) {
            const idNum = parseInt(storedIdString, 10);
            if (!isNaN(idNum)) {
                console.log(`DesignPage(Load): Loading existing design ID ${idNum}.`);
                setImageUrl(storedHasRemovedBg && storedNoBgUrl ? storedNoBgUrl : storedImageUrl);
                setDesignDetails({
                    id: idNum,
                    originalUrl: storedImageUrl,
                    noBgUrl: storedNoBgUrl,
                    hasRemovedBg: storedHasRemovedBg
                });
                setLoading(false);
            } else {
                console.error(`DesignPage(Load): FAILED to parse storedIdString ('${storedIdString}')`);
                setError('Invalid design ID found. Please select again.');
                localStorage.removeItem('generatedImageId');
                localStorage.removeItem('generatedImageUrl');
                setLoading(false);
            }
        } else {
            console.error("DesignPage(Load): Required ID or URL missing from localStorage.");
            setError("Failed to load design details. Please select again.");
            setLoading(false);
        }
    } 
    // **Scenario 2: Explicit Intent to Generate**
    else if (intent === 'generate') { 
        console.log("DesignPage: Intent is 'generate'. Triggering NEW image generation.");
        // We call generateImage immediately. 
        // generateImage itself will handle waiting for userId if needed.
        // Pass forceRegenerate=true to ensure clearing of any potentially stale state/storage.
        generateImage(storedPrompt, controller.signal, true);
        // Note: setLoading(false) happens inside generateImage's finally block
    } 
    // **Scenario 3: Unknown Intent (Error Case)**
    else {
        console.error(`DesignPage: Unknown designIntent value: '${intent}'`);
        setError("Invalid page state. Please start again.");
        setLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('DesignPage: Cleanup mount useEffect.');
      controller.abort();
    };
    // Run only ONCE on mount
  }, []); // <<< EMPHASIS: Empty dependency array!

  // --- Generate Image Function ---
  const generateImage = async (
    promptText: string,
    signal?: AbortSignal,
    forceRegenerate: boolean = false,
    referenceUrl?: string
  ) => {
    // Allow generation call even if loading=true when forceRegenerate is set
    if (loading && !forceRegenerate) {
         console.log("generateImage: Already loading/generating and not forcing, skipping.");
         return;
    }

    console.log('generateImage: Starting... ', { promptText, forceRegenerate, referenceUrl, userId });
    setLoading(true);
    setError(''); // Clear previous errors
    
    // If forcing regenerate, clear old details immediately
    if (forceRegenerate) {
        setDesignDetails({ id: null, originalUrl: null, noBgUrl: null, hasRemovedBg: false });
        setImageUrl(null); 
        localStorage.removeItem('generatedImageId'); 
        localStorage.removeItem('generatedImageUrl');
        localStorage.removeItem('noBackgroundUrl');
        localStorage.removeItem('hasRemovedBackground');
        console.log("generateImage: Cleared previous image details (forceRegenerate=true).");
    }

    // --- Check for userId --- 
    // Wait slightly if userId isn't set yet, but don't block indefinitely
    let currentUserId = userId;
    if (!currentUserId) {
        console.warn("generateImage: userId not available yet. Will use value from localStorage directly if needed.");
        currentUserId = localStorage.getItem('userId'); // Try reading directly as fallback
        if (!currentUserId) {
             console.error("generateImage: CRITICAL - userId is null even in localStorage. Cannot generate.");
             setError("Cannot generate image: User identifier is missing.");
             setLoading(false);
             return; // Stop if no user ID at all
        }
    }
    // --- End userId Check --- 

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3001'}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({
          prompt: promptText,
          userId: currentUserId, // Use the obtained userId
          regenerate: forceRegenerate,
          referenceUrl: referenceUrl,
        }),
        signal,
        cache: 'no-store'
      });

      const responseBody = await response.json(); 

      if (!response.ok) {
        console.error("generateImage API error:", response.status, responseBody);
        throw new Error(responseBody.error || `Failed to generate image (status ${response.status})`);
      }

      console.log('generateImage: API success. Response data:', responseBody);
      setImageUrl(responseBody.imageUrl);

      // --- CRITICAL: Save the NUMERIC ID (parsing concisely) --- 
      let numericId: number | null = null;
      if (responseBody.id != null) { // Check for null or undefined
          const potentialNum = +responseBody.id; // Attempt conversion using unary plus
          if (!isNaN(potentialNum)) { // Check if conversion was successful (not NaN)
              numericId = potentialNum;
              console.log(`generateImage: Converted/Validated NUMERIC ID: ${numericId} (Original type: ${typeof responseBody.id})`);
          } else {
               console.error(`generateImage: FAILED to convert backend ID ('${responseBody.id}') to a number.`);
          }
      } else {
          console.error(`generateImage: Received null or undefined ID from backend.`);
      }

      if (numericId !== null) {
          setDesignDetails(prev => ({
              ...prev, 
              id: numericId, // <<< Set numeric ID in state
              originalUrl: responseBody.imageUrl // Set original URL
          }));
          localStorage.setItem('generatedImageId', numericId.toString()); // <<< Save as string
          localStorage.setItem('generatedImageUrl', responseBody.imageUrl);
          localStorage.removeItem('noBackgroundUrl');
          localStorage.setItem('hasRemovedBackground', 'false');
          console.log(`generateImage: Saved numeric ID ${numericId} to localStorage & state.`);
      } else {
          console.error('generateImage: FAILED to get a valid NUMERIC ID from backend response.');
          setError("Failed to get a valid ID for the generated image. Cannot add to cart later.");
          localStorage.removeItem('generatedImageId');
          setDesignDetails(prev => ({ ...prev, id: null, originalUrl: responseBody.imageUrl })); // Store URL but clear ID
      }
      // --- End ID Handling ---

    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name !== 'AbortError') {
        console.error('generateImage: Exception caught:', err);
        setError(`Image generation failed: ${ (err as Error).message || 'Unknown error'}`);
        setImageUrl('https://placehold.co/600x600/gray/white?text=Error'); 
      } else {
        console.log("generateImage: Aborted.");
      }
    } finally {
      setLoading(false);
      console.log("generateImage: Finished.");
    }
  };

  // --- Regenerate Functions ---
  // These should clear relevant localStorage and call generateImage with forceRegenerate=true
  const handleRegenerate = () => {
    if (!prompt) return;
    console.log("handleRegenerate: Regenerating with original prompt.");
    setEditablePrompt(prompt); // Reset editable prompt
    setUseReferenceImage(false);
    // generateImage will clear localStorage because forceRegenerate is true
    generateImage(prompt, undefined, true);
  };

  const handleRegenerateWithChanges = () => {
    if (!editablePrompt) return;
    console.log("handleRegenerateWithChanges: Regenerating with edited prompt.");
    let refUrl: string | undefined = useReferenceImage ? designDetails.originalUrl || undefined : undefined;
    setPrompt(editablePrompt); // Update main prompt state
    // generateImage will clear localStorage because forceRegenerate is true
    generateImage(editablePrompt, undefined, true, refUrl);
  };


  // --- Background Removal Logic (no changes needed here) ---
  const handleBackgroundRemoval = async () => {
    if (!designDetails.originalUrl || designDetails.hasRemovedBg || typeof designDetails.id !== 'number') return;
    setIsRemovingBackground(true); setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/generate-image/remove-background`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ imageId: designDetails.id }),
      });
      const responseBody = await response.json();
      if (!response.ok) throw new Error(responseBody.error || `Failed to remove background (status ${response.status})`);
      const { noBackgroundUrl } = responseBody;
      if (!noBackgroundUrl) throw new Error("Background removed, but no URL was returned.");
      setImageUrl(noBackgroundUrl);
      setDesignDetails(prev => ({ ...prev, noBgUrl: noBackgroundUrl, hasRemovedBg: true }));
      localStorage.setItem('noBackgroundUrl', noBackgroundUrl);
      localStorage.setItem('hasRemovedBackground', 'true');
    } catch (err: any) { setError(err.message || 'Error removing background.'); }
    finally { setIsRemovingBackground(false); }
  };

  const handleRestoreOriginal = () => {
    if (!designDetails.originalUrl) return;
    setImageUrl(designDetails.originalUrl);
    setDesignDetails(prev => ({ ...prev, hasRemovedBg: false }));
    localStorage.setItem('hasRemovedBackground', 'false');
  };

  // --- Add item to cart and navigate to checkout ---
  const handleProceedToCheckout = () => {
    setError(null); // Clear previous errors
    console.log("handleProceedToCheckout: Attempting. Current designDetails.id:", designDetails.id, "(type:", typeof designDetails.id, ")");

    // --- **MOST IMPORTANT CHECK**: Ensure designDetails.id is a valid number ---
    if (typeof designDetails.id !== 'number' || isNaN(designDetails.id)) {
        console.error("CRITICAL CHECK FAILED: designDetails.id is not a valid number:", designDetails.id);
        setError("Cannot proceed: Design ID is missing or invalid. Please try regenerating the image or selecting it again.");
        return; // Stop execution
    }
    // --- End Critical Check ---

    console.log(`handleProceedToCheckout: Proceeding with NUMERIC ID: ${designDetails.id}`);

    // Determine the final URL (original or no-background)
    const urlToAdd = designDetails.hasRemovedBg && designDetails.noBgUrl
        ? designDetails.noBgUrl
        : designDetails.originalUrl;

    if (!urlToAdd) {
        console.error("handleProceedToCheckout: Cannot proceed, effective image URL is missing.");
        setError("Cannot proceed: Image URL is missing.");
        return;
    }

    // --- Create cart item using the validated NUMERIC ID --- 
    const newItem: CheckoutItem = {
      id: designDetails.id, // <<< Uses the validated numeric ID from state
      imageUrl: urlToAdd,
      quantity: 1, // Start with quantity 1
    };
    // --- End Item Creation ---

    let existingItems: CheckoutItem[] = [];
    try {
        // Load and parse existing cart items, ensuring they also have NUMERIC IDs
        const storedItemsString = localStorage.getItem('checkoutItems');
        if (storedItemsString) {
            const parsed = JSON.parse(storedItemsString);
            if (Array.isArray(parsed)) {
                existingItems = parsed.filter(item =>
                    item && typeof item.id === 'number' && // <<< Validate existing item ID type
                    typeof item.imageUrl === 'string' &&
                    typeof item.quantity === 'number'
                );
                // Log if filtering removed items due to invalid IDs
                if (existingItems.length !== parsed.length) {
                     console.warn("handleProceedToCheckout: Filtered out invalid items from stored cart data.");
                }
            } else { console.warn("'checkoutItems' in localStorage was not an array."); }
        }
    } catch (e) {
        console.error("Error parsing 'checkoutItems' from localStorage:", e);
        setError("Error reading your cart. Please try again.");
        return; // Stop if cart is corrupted
    }

    // Find if item exists (using numeric ID) and update/add
    const itemIndex = existingItems.findIndex(item => item.id === newItem.id);
    let updatedItems = [...existingItems];

    if (itemIndex === -1) {
        // Item not found, add it
        updatedItems.push(newItem);
        console.log("handleProceedToCheckout: Adding new item to cart (Numeric ID):", newItem.id);
    } else {
        // Item found, increment quantity and update URL if necessary
        updatedItems[itemIndex].quantity = (updatedItems[itemIndex].quantity || 0) + 1;
        if (updatedItems[itemIndex].imageUrl !== newItem.imageUrl) {
             console.log("handleProceedToCheckout: Updating URL for existing item (Numeric ID):", newItem.id);
             updatedItems[itemIndex].imageUrl = newItem.imageUrl;
        }
        console.log("handleProceedToCheckout: Incremented quantity for existing item (Numeric ID):", newItem.id, "New Qty:", updatedItems[itemIndex].quantity);
    }

    // Save updated cart and navigate
    try {
        console.log("handleProceedToCheckout: Saving updated cart:", updatedItems);
        localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
        window.dispatchEvent(new StorageEvent('storage', { key: 'checkoutItems' }));
        console.log("handleProceedToCheckout: Navigating to checkout...");
        router.push('/checkout');
    } catch (e) {
        console.error("handleProceedToCheckout: Error saving cart or navigating:", e);
        setError("Failed to update cart or navigate.");
    }
  };

  // --- Render Logic --- 
  // ... (Keep the existing render logic, just update the disabled prop as needed)

  // Example modification for the checkout button's disabled state:
  // disabled={typeof designDetails.id !== 'number' || loading || isRemovingBackground}


  // --- RETURN JSX (Keep the structure, just update the disabled prop as needed) ---
    return (
    <main className="min-h-screen flex flex-col items-center p-6">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl z-10 backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-2xl border border-white/60">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">Your Design</h1>

         {/* Display general errors first */}
         {error && !loading && ( // Show errors only if not loading
            <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
                {error}
                 {/* Optionally add a retry button here if the error is related to loading/generation */} 
                 {error.includes("generation failed") && (
                    <button onClick={handleRegenerate} className="mt-2 underline"> Try generating again?</button>
                 )}
            </div>
          )}

        {/* Main Content Area */} 
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] border-2 border-purple-200/50 rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            <p className="mt-6 text-lg font-medium text-purple-800">
                {imageUrl ? 'Loading...' : 'Crafting your masterpiece...'} {/* Indicate if just loading vs generating */}
            </p>
          </div>
        ) : imageUrl ? ( // Only show image and controls if imageUrl is present
          <div className="space-y-6">
            {/* Image Display */} 
            <div className="relative h-[400px] w-full border-2 border-purple-200/50 rounded-lg overflow-hidden backdrop-blur-sm shadow-lg bg-gray-100">
              <Image src={imageUrl} alt={prompt || "Generated sticker design"} fill
                 style={{ objectFit: 'contain' }} className="p-1" priority unoptimized />
               {(isRemovingBackground) && ( // Overlay for background removal processing
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      <p className="text-white ml-3">Removing Background...</p>
                  </div>
                )}
            </div>

            {/* Edit Prompt & Regenerate Section */} 
             <div className="flex flex-col gap-4">
                <div className="space-y-4 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200/50 shadow-md">
                    <div>
                        <label htmlFor="editablePrompt" className="block text-sm font-medium text-purple-800 mb-1">Edit Your Prompt:</label>
                        <textarea id="editablePrompt" value={editablePrompt} onChange={(e) => setEditablePrompt(e.target.value)}
                            rows={3} className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white/80"
                            placeholder="Describe your desired sticker..." />
                    </div>
                    <div className="flex items-center">
                        <input id="useReferenceImage" type="checkbox" checked={useReferenceImage} onChange={(e) => setUseReferenceImage(e.target.checked)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            disabled={!designDetails.originalUrl} // Disable if no original image
                        />
                        <label htmlFor="useReferenceImage" className={`ml-2 block text-sm font-medium ${!designDetails.originalUrl ? 'text-gray-400' : 'text-purple-800'}`}>
                            Use current image as reference?
                        </label>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleRegenerateWithChanges} disabled={loading || isRemovingBackground || !editablePrompt}
                        className={`py-3 px-6 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg flex-1 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed`} >
                        {loading ? 'Generating...' : 'Regenerate 🎨'}
                    </button>
                </div>
             </div>
             {/* Spacer */} 
            <div className="flex-grow"></div>

            {/* Action Buttons */} 
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-purple-100">
                <button onClick={() => router.back()}
                    className="w-full art-button py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300"> Back </button>
                <button onClick={handleProceedToCheckout}
                    className="w-full art-button py-3 px-6 rounded-lg text-white font-bold focus:outline-none transition-all duration-300 opacity-100 disabled:opacity-50"
                    // --- Disable ONLY when loading --- 
                    disabled={loading} >
                    Continue to Checkout </button>
            </div>

          </div>
        ) : (
             // Case where loading is false, but imageUrl is still null/empty (should ideally show error, but fallback)
            <div className="text-center p-10">No image to display. Check console for errors.</div>
        )}

        {/* Display original prompt below main content */} 
        {prompt && (
             <div className="mt-8">
                <h2 className="text-xl font-bold mb-3 text-purple-800">Original Prompt:</h2>
                <p className="p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200/50 shadow-md">{prompt}</p>
             </div>
        )}

      </div>
    </main>
  );
} 