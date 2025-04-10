'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Import Stripe
import { loadStripe } from '@stripe/stripe-js';
// Remove CardElement and useElements, keep useStripe and Elements
import { Elements, useStripe } from '@stripe/react-stripe-js';

// Define constants outside the component
const BASE_PRICE = 3.50;
const BACKGROUND_REMOVAL_COST = 2.00;
const STANDARD_SHIPPING_COST = 4.69;

// Load Stripe with your publishable key (replace with your actual key, preferably from env vars)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace placeholder or use env variable

// Define an interface for a single checkout item
interface CheckoutItem {
  id: number; // Use numeric DB ID
  imageUrl: string;
  quantity: number;
}

// Define the ShippingForm interface (already exists)
interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
}

// Define the CheckoutForm component that uses Stripe hooks
function CheckoutForm() {
  const stripe = useStripe();
  const router = useRouter();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'US',
    region: '',
    address1: '',
    address2: '',
    city: '',
    zip: '',
  });
  // --- Add Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  useEffect(() => {
    // --- Load items from localStorage ---
    // Assume items are stored as a JSON string under 'checkoutItems'
    // Each item should have { id (number), imageUrl, quantity }
    const storedItemsString = localStorage.getItem('checkoutItems');
    if (storedItemsString) {
      try {
        // Use a more permissive type for initial parsing, then validate
        const parsedItems: any[] = JSON.parse(storedItemsString);

        // Validate and map to the CheckoutItem structure
        const validatedItems: CheckoutItem[] = parsedItems
          .filter(item => 
              item && 
              typeof item.id === 'number' && // Check if id is a number
              typeof item.imageUrl === 'string'
           )
          .map(item => ({
            id: item.id, // Keep numeric id
            imageUrl: item.imageUrl,
            quantity: typeof item.quantity === 'number' && item.quantity >= 1 ? Math.floor(item.quantity) : 1, 
          }));

        if (validatedItems.length > 0) {
          setItems(validatedItems);
        } else {
          console.warn('No valid checkout items found in localStorage after validation.');
          // router.push('/'); // Redirect if no valid items remain
        }
      } catch (e) {
        console.error('Failed to parse or validate checkout items from localStorage:', e);
        localStorage.removeItem('checkoutItems'); // Clear corrupted data
        // router.push('/'); // Redirect on error
      }
    } else {
      console.log('No checkout items found in localStorage.');
      // router.push('/'); // Redirect if no items key
    }
    // --- End Load Items ---

    // Clear individual item flags from local storage if they exist
    localStorage.removeItem('generatedImageUrl');
    setLoading(false); // Set loading false after attempt

  }, [router]);

  // Handler for updating quantity for a specific item
  const handleQuantityChange = (itemId: number, newQuantity: number) => { // itemId is now number
    setItems(currentItems => {
      const updatedItems = currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      );
      // Persist changes back to localStorage
      try {
        localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
         // Trigger storage event manually so nav updates
        window.dispatchEvent(new StorageEvent('storage', { key: 'checkoutItems' }));
      } catch (error) {
        console.error("Failed to save updated quantities to localStorage:", error);
        // Optionally notify the user or handle the error
      }
      return updatedItems;
    });
  };

  // Function to remove an item and update localStorage
  const handleRemoveItem = (itemId: number) => { // itemId is now number
      setItems(currentItems => {
        const updatedItems = currentItems.filter(i => i.id !== itemId);
        try {
            localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
            // Trigger storage event manually so nav updates
            window.dispatchEvent(new StorageEvent('storage', { key: 'checkoutItems' })); 
        } catch (error) {
            console.error("Failed to save updated items to localStorage after removal:", error);
        }
        return updatedItems;
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Refactored Price Calculation ---
  const {
    totalQuantity,
    stickerPricePerItem,
    discountPercentage,
    stickerSubtotal,
    subtotalBeforeShipping,
    shippingCost,
    totalPrice,
    isShippingFree,
  } = useMemo(() => {
    // Use the constants defined outside
    const basePrice = BASE_PRICE;
    const backgroundRemovalCost = BACKGROUND_REMOVAL_COST;
    const standardShippingCost = STANDARD_SHIPPING_COST;

    const currentTotalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    let currentStickerPrice = basePrice;
    let discountPercent = 0;
    // Apply discount based on *total* quantity
    if (currentTotalQuantity >= 10) { // 10+ items: 20% off, free shipping
        currentStickerPrice = basePrice * 0.8;
        discountPercent = 20;
    } else if (currentTotalQuantity >= 5) { // 5-9 items: 20% off, standard shipping
        currentStickerPrice = basePrice * 0.8;
        discountPercent = 20;
    } else if (currentTotalQuantity >= 2) { // 2-4 items: 10% off, standard shipping
        currentStickerPrice = basePrice * 0.9;
        discountPercent = 10;
    }
    // Note: If quantity is 1, price remains basePrice, discountPercent is 0.

    const stickersTotal = items.reduce((sum, item) => sum + (currentStickerPrice * item.quantity), 0);
    const currentSubtotal = stickersTotal;

    const shippingIsFree = currentTotalQuantity >= 10;
    const currentShippingCost = shippingIsFree ? 0 : standardShippingCost;
    const currentTotalPrice = currentSubtotal + currentShippingCost;

    return {
      totalQuantity: currentTotalQuantity,
      stickerPricePerItem: currentStickerPrice, // This is now the *discounted* price per item based on total quantity
      discountPercentage: discountPercent,
      stickerSubtotal: stickersTotal,
      subtotalBeforeShipping: currentSubtotal,
      shippingCost: currentShippingCost,
      totalPrice: currentTotalPrice,
      isShippingFree: shippingIsFree,
    };
  }, [items]); // Depend on the items array
  // --- End Price Calculation ---

  // Update handleSubmit for Stripe Checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true); // Use specific state for payment processing
    setError('');

    // Only check if stripe has loaded
    if (!stripe) {
      setError('Stripe is not ready. Please wait a moment and try again.');
      setIsProcessingPayment(false);
      return;
    }

    if (items.length === 0) {
        setError('Your cart is empty.');
        setIsProcessingPayment(false);
        return;
    }

    // Ensure all quantities are valid (should be handled by UI, but double-check)
    if (items.some(item => item.quantity < 1)) {
        setError('One or more items have an invalid quantity.');
        setIsProcessingPayment(false);
        return;
    }

    try {
      // 1. Create Checkout Session on the backend
       // Map items to the structure expected by the backend
      const backendItems = items.map(item => ({
        id: item.id, // Send the numeric ID
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      }));

      console.log("Creating checkout session with items:", backendItems);
      console.log("Shipping Address:", formData);


      const checkoutSessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send shipping details and item info (including quantity)
        body: JSON.stringify({
          items: backendItems, // Send the array of items
          shippingAddress: { // Format shipping address for backend
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            region: formData.region,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            zip: formData.zip,
          },
          // userId: localStorage.getItem('userId'), // REMOVED - User will be identified/created by email in webhook
        }),
      });

      if (!checkoutSessionResponse.ok) {
        const errorData = await checkoutSessionResponse.json();
        throw new Error(errorData.error || `Failed to create checkout session (Status: ${checkoutSessionResponse.status})`);
      }

      const { sessionId } = await checkoutSessionResponse.json(); // Expect sessionId

      if (!sessionId) {
        throw new Error('Session ID not received from server.');
      }

      // 2. Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (stripeError) {
        console.error('Stripe redirection error:', stripeError);
        setError(stripeError.message || 'Failed to redirect to Stripe Checkout.');
        // No need to set loading false here as we are redirecting or failed already
        setIsProcessingPayment(false); // Set processing false on redirection failure
        return; // Added return here
      }
      // On successful redirection, this component unmounts, no need to set state
    } catch (error: any) {
      console.error('Error during checkout process:', error);
      setError(error.message || 'An unexpected error occurred during checkout.');
      setIsProcessingPayment(false); // Set loading false only on failure
    }
  };

  // --- Modal Handlers ---
  const openModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(''); // Clear image URL when closing
  };

  // --- Render Logic Update ---
  if (loading) {
    // Add a simple loading state while fetching items initially
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-purple-700">Loading Checkout...</p>
        {/* Optional: Add a spinner */}
        <svg className="animate-spin ml-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl z-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        Complete Your Order
      </h1>
      {/* Display general errors */}
      {error && (
        <div className="mb-4 text-center py-2 px-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* --- Column 1: Pricing Tiers (Span 1) --- */}
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 space-y-4 relative z-10 md:order-1 order-2 md:col-span-1">
          <h3 className="font-bold text-lg text-purple-800 mb-2 text-center">Pricing Deals! ✨</h3>
           <p className="text-sm text-center text-purple-700 mb-3">(Based on total sticker count)</p>
          <ul className="space-y-2 text-sm">
             {/* Dynamic highlighting based on totalQuantity */}
            <li
              className={`p-2 rounded-lg border transition-all ${
                totalQuantity === 1 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🛍️ 1 Sticker:</span> ${BASE_PRICE.toFixed(2)} ea + ${STANDARD_SHIPPING_COST.toFixed(2)} Shipping
            </li>
            <li
              className={`p-2 rounded-lg border transition-all ${
                totalQuantity >= 2 && totalQuantity <= 4 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🎉 2-4 Stickers:</span> ${(BASE_PRICE * 0.9).toFixed(2)} ea (10% off!) + ${STANDARD_SHIPPING_COST.toFixed(2)} Shipping
            </li>
            <li
              className={`p-2 rounded-lg border transition-all ${
                 totalQuantity >= 5 && totalQuantity <= 9 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🚀 5-9 Stickers:</span> ${(BASE_PRICE * 0.8).toFixed(2)} ea (20% off!) + ${STANDARD_SHIPPING_COST.toFixed(2)} Shipping
            </li>
            {/* Updated Free Shipping Tier */}
            <li
              className={`p-2 rounded-lg border font-semibold transition-all ${
                isShippingFree ? 'bg-green-100 border-green-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🚚 10+ Stickers:</span> ${(BASE_PRICE * 0.8).toFixed(2)} ea (20% off!) + FREE Shipping!
            </li>
          </ul>
        </div>
        {/* --- End Column 1 --- */}

        {/* --- Column 2: Item List & Order Summary (Span 2) --- */}
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 space-y-6 relative z-10 md:order-2 order-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-purple-800">Your Items ({totalQuantity})</h2>

            {/* --- Item List --- */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border rounded-lg p-3 bg-white/20 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
                {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b border-purple-200/50 pb-3 last:border-b-0">
                    {/* Image Thumbnail - Add onClick */}
                    <button
                        type="button"
                        onClick={() => openModal(item.imageUrl)}
                        className="relative h-20 w-20 border border-purple-200/50 rounded-md overflow-hidden bg-white/50 flex-shrink-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        aria-label={`View larger image for item ${item.id}`} // Use numeric ID
                    >
                        <Image
                            src={item.imageUrl}
                            alt="Sticker design thumbnail"
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="(max-width: 768px) 10vw, 5vw" 
                            priority={false}
                        />
                         {/* Optional: Add a small zoom icon on hover */}
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                    </button>
                    {/* Item Details & Quantity */}
                    <div className="flex-grow">
                    <p className="text-sm font-medium text-purple-900">Custom Sticker</p>
        
                    {/* Quantity Selector Per Item */}
                    <div className="flex items-center space-x-2 mt-1">
                        <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)} // Use numeric ID
                        className="px-2 py-0.5 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        disabled={item.quantity <= 1 || isProcessingPayment}
                        aria-label={`Decrease quantity for item ${item.id}`} // Use numeric ID
                        >
                        -
                        </button>
                        <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            // Update quantity, defaulting to 1 if input is cleared or invalid
                            handleQuantityChange(item.id, isNaN(val) || val < 1 ? 1 : val); // Use numeric ID
                        }}
                        onBlur={(e) => {
                            // Ensure quantity is at least 1 when focus leaves the input
                             if (item.quantity < 1) {
                                handleQuantityChange(item.id, 1); // Use numeric ID
                            }
                        }}
                        className="text-sm font-medium w-10 text-center border border-purple-300 rounded p-0.5 bg-white/70 focus:ring-1 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`Quantity for item ${item.id}`} // Use numeric ID
                        disabled={isProcessingPayment}
                        />
                        <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)} // Use numeric ID
                        className="px-2 py-0.5 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 text-sm"
                        disabled={isProcessingPayment}
                        aria-label={`Increase quantity for item ${item.id}`} // Use numeric ID
                        >
                        +
                        </button>
                    </div>
                    </div>
                     {/* Item Price (Optional, could be confusing with overall discount) */}
                     {/* <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">${(stickerPricePerItem * item.quantity + (item.hasRemovedBackground ? backgroundRemovalCost * item.quantity : 0)).toFixed(2)}</p>
                    </div> */}
                     {/* Add a remove button per item */}
                    <button
                        onClick={() => handleRemoveItem(item.id)} // Use numeric ID
                        className="ml-auto p-1 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50"
                        disabled={isProcessingPayment}
                        aria-label={`Remove item ${item.id}`} // Use numeric ID
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                ))}
                {items.length === 0 && <p className="text-center text-purple-700 py-4">Your cart is empty.</p>}
            </div>
            {/* --- End Item List --- */}

           {/* --- Order Summary --- */}
          <div className="border-t border-purple-200/50 pt-4 space-y-2">
            <h3 className="font-bold text-xl text-purple-800">Order Summary</h3>
             <div className="flex justify-between mt-3 text-lg">
                {/* Changed label to reflect total quantity */}
                <span>Stickers Total ({totalQuantity})</span>
                <span className="font-medium">${stickerSubtotal.toFixed(2)}</span>
            </div>
             {discountPercentage > 0 && (
              <div className="flex justify-between mt-1 text-sm text-green-700">
                <span>({discountPercentage}% discount applied)</span>
                {/* Show the effective price per item */}
                <span>@ ${stickerPricePerItem.toFixed(2)} ea</span>
              </div>
            )}
            {/* Show background removal total only if at least one item has it */}
            {/* REMOVE background removal cost logic entirely */}
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="font-medium">${subtotalBeforeShipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Shipping</span>
              {isShippingFree ? (
                <span className="font-medium text-green-700">FREE!</span>
              ) : (
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between mt-3 text-xl font-bold border-t border-purple-200/50 pt-2">
              <span>Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
           {/* --- End Order Summary --- */}
        </div>
        {/* --- End Column 2 --- */}

        {/* --- Column 3: Shipping and Payment Form (Span 2) --- */}
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 md:order-3 order-3 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Shipping Information</h2>
            {/* Shipping form fields remain the same, disable when processing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-purple-900">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                  disabled={isProcessingPayment}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-purple-900">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                   disabled={isProcessingPayment}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-900">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                required
                disabled={isProcessingPayment}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-purple-900">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                required
                disabled={isProcessingPayment}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-purple-900">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                  disabled={isProcessingPayment}
                >
                  <option value="US">United States</option>
                </select>
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-purple-900">
                  State
                </label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                   disabled={isProcessingPayment}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-purple-900">
                Address Line 1
              </label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                required
                 disabled={isProcessingPayment}
              />
            </div>

            <div>
              <label htmlFor="address2" className="block text-sm font-medium text-purple-900">
                Address Line 2 (optional)
              </label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                 disabled={isProcessingPayment}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-purple-900">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                   disabled={isProcessingPayment}
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-purple-900">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  required
                   disabled={isProcessingPayment}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
               // Disable if processing payment, stripe not ready, or no items in the cart
              disabled={isProcessingPayment || !stripe || items.length === 0}
              className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isProcessingPayment ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : items.length > 0 ? (
                  `Pay $${totalPrice.toFixed(2)} ✨`
                ) : (
                  'Cart is Empty' // Indicate cart is empty if button is disabled for that reason
                )}
              </span>
            </button>
          </form>
        </div>
        {/* --- End Column 3 --- */}
      </div>

        {/* --- Image Modal --- */}
        {isModalOpen && modalImageUrl && (
            <div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={closeModal} // Close modal on overlay click
            >
                <div 
                    className="relative p-4 rounded-lg shadow-xl max-w-xl max-h-[80vh] w-full h-auto" 
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                >
                    {/* Close Button */}
                    <button 
                        onClick={closeModal}
                        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        aria-label="Close image viewer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {/* Large Image */}
                    <div className="relative w-full h-[70vh]">
                        <Image
                            src={modalImageUrl}
                            alt="Enlarged sticker design"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>
            </div>
        )}
        {/* --- End Image Modal --- */}

    </div>
  );
}

// Main component wrapping the form with Elements provider
export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden">
      {/* Background Blobs (keep as is) */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Wrap the form content with Elements */}
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </main>
  );
}
