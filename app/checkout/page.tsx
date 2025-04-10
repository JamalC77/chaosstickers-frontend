'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Import Stripe
import { loadStripe } from '@stripe/stripe-js';
// Remove CardElement and useElements, keep useStripe and Elements
import { Elements, useStripe } from '@stripe/react-stripe-js';

// Load Stripe with your publishable key (replace with your actual key, preferably from env vars)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace placeholder or use env variable

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
  // Remove useElements hook
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRemovedBackground, setHasRemovedBackground] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false); // Keep background removal logic
  const [error, setError] = useState(''); // General error state
  const [quantity, setQuantity] = useState(1); // Added quantity state, default 1
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

  useEffect(() => {
    const storedImageUrl = localStorage.getItem('generatedImageUrl');
    if (!storedImageUrl) {
      router.push('/');
      return;
    }
    setImageUrl(storedImageUrl);
    const storedHasRemovedBg = localStorage.getItem('hasRemovedBackground') === 'true';
    setHasRemovedBackground(storedHasRemovedBg);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Dynamic Price Calculation Logic ---
  const {
    stickerPricePerItem,
    discountPercentage,
    stickerSubtotal,
    backgroundRemovalSubtotal,
    subtotalBeforeShipping,
    shippingCost,
    totalPrice,
    isShippingFree,
  } = useMemo(() => {
    const basePrice = 3.50;
    const backgroundRemovalCost = 2.00;
    const standardShippingCost = 4.69;

    let currentStickerPrice = basePrice;
    let discountPercent = 0;
    if (quantity >= 5) {
      currentStickerPrice = basePrice * 0.8; // 20% discount
      discountPercent = 20;
    } else if (quantity >= 2) {
      currentStickerPrice = basePrice * 0.9; // 10% discount
      discountPercent = 10;
    }

    const stickersTotal = currentStickerPrice * quantity;
    const bgRemovalTotal = hasRemovedBackground ? backgroundRemovalCost * quantity : 0;
    const currentSubtotal = stickersTotal + bgRemovalTotal;

    // Changed: Shipping is free if quantity is 10 or more
    const shippingIsFree = quantity >= 10;
    const currentShippingCost = shippingIsFree ? 0 : standardShippingCost;
    const currentTotalPrice = currentSubtotal + currentShippingCost;

    return {
      stickerPricePerItem: currentStickerPrice,
      discountPercentage: discountPercent,
      stickerSubtotal: stickersTotal,
      backgroundRemovalSubtotal: bgRemovalTotal,
      subtotalBeforeShipping: currentSubtotal,
      shippingCost: currentShippingCost,
      totalPrice: currentTotalPrice,
      isShippingFree: shippingIsFree,
    };
  }, [quantity, hasRemovedBackground]);
  // --- End Price Calculation ---

  // Update handleSubmit for Stripe Checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Only check if stripe has loaded
    if (!stripe) {
      setError('Stripe is not ready. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Checkout Session on the backend
      const checkoutSessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send shipping details and item info (including quantity)
        body: JSON.stringify({
          items: [{
            imageUrl,
            quantity: quantity, // Send the current quantity
            removeBackground: hasRemovedBackground
          }],
          shippingAddress: {
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
          userId: 1,
        }),
      });

      if (!checkoutSessionResponse.ok) {
        const errorData = await checkoutSessionResponse.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
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
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Error during checkout process:', error);
      setError(error.message || 'An unexpected error occurred during checkout.');
      setLoading(false);
    }
  };

  // Keep handleRemoveBackground as is
  const handleRemoveBackground = async () => {
    console.log('handleRemoveBackground function called');
    setError('');
    if (!imageUrl) {
      console.error('Image URL is missing, cannot remove background.');
      setError('Cannot remove background without a valid image URL.');
      return;
    }
    console.log('Proceeding with background removal, imageUrl:', imageUrl);
    setIsRemovingBackground(true);
    try {
      const bgResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/image/remove-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      console.log('Background removal API response status:', bgResponse.status);
      if (!bgResponse.ok) {
        throw new Error(`Failed to remove background. Status: ${bgResponse.status}`);
      }
      const bgData = await bgResponse.json();
      console.log('Background removal successful:', bgData);
      setImageUrl(bgData.imageUrl);
      localStorage.setItem('generatedImageUrl', bgData.imageUrl);
      setHasRemovedBackground(true);
      localStorage.setItem('hasRemovedBackground', 'true');
    } catch (err) {
      console.error('Error in background removal process:', err);
      setError('Failed to remove background. Please try again.');
    } finally {
      setIsRemovingBackground(false);
    }
  };

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
          <ul className="space-y-2 text-sm">
            <li
              className={`p-2 rounded-lg border transition-all ${
                quantity === 1 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🛍️ 1 Sticker:</span> $3.50 ea + $4.69 Shipping
            </li>
            <li
              className={`p-2 rounded-lg border transition-all ${
                quantity >= 2 && quantity <= 4 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🎉 2-4 Stickers:</span> $3.15 ea (10% off!) + $4.69 Shipping
            </li>
            <li
              className={`p-2 rounded-lg border transition-all ${
                quantity >= 5 && !isShippingFree ? 'bg-purple-100 border-purple-300 scale-105' : 'bg-white/50 border-white/60'
              }`}
            >
              <span className="font-semibold">🚀 5-9 Stickers:</span> $2.80 ea (20% off!) + $4.69 Shipping
            </li>
            {/* Updated Free Shipping Tier */}
            <li 
              className={`p-2 rounded-lg border font-semibold transition-all ${ 
                isShippingFree ? 'bg-green-100 border-green-300 scale-105' : 'bg-white/50 border-white/60' 
              }`} 
            >
              <span className="font-semibold">🚚 10+ Stickers:</span> $2.80 ea (20% off!) + FREE Shipping!
            </li>
          </ul>
        </div>
        {/* --- End Column 1 --- */}

        {/* --- Column 2: Product Preview & Order Summary (Span 2) --- */}
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 space-y-4 relative z-10 md:order-2 order-1 md:col-span-2">
          <h2 className="text-2xl font-bold text-purple-800">Your Amazing Sticker</h2>
          <div className="relative h-[300px] w-full border-2 border-purple-200/50 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Your sticker design"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-purple-500">
                Loading Image...
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity <= 1 || loading}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) {
                  setQuantity(val);
                } else if (e.target.value === '') {
                  setQuantity(1);
                }
              }}
              className="text-xl font-medium w-16 text-center border border-purple-300 rounded-md p-1 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
              disabled={loading}
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              disabled={loading}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Background Removal Status/Error */}
          {isRemovingBackground && (
            <div className="text-center py-2 px-4 bg-blue-100 text-blue-800 rounded-lg mt-4">
              Removing background... Please wait.
            </div>
          )}
          {hasRemovedBackground && !isRemovingBackground && (
            <div className="text-center py-2 px-4 bg-green-100 text-green-800 rounded-lg mt-4">
              Background successfully removed! ✅
            </div>
          )}

          <div className="border-t border-purple-200/50 pt-4">
            <h3 className="font-bold text-xl text-purple-800">Order Summary</h3>
            <div className="flex justify-between mt-3 text-lg">
              <span>Custom Sticker (x{quantity})</span>
              <span className="font-medium">${stickerSubtotal.toFixed(2)}</span>
            </div>
            {discountPercentage > 0 && (
              <div className="flex justify-between mt-1 text-sm text-green-700">
                <span>({discountPercentage}% discount applied)</span>
                <span>@ ${stickerPricePerItem.toFixed(2)} ea</span>
              </div>
            )}
            {hasRemovedBackground && (
              <div className="flex justify-between mt-2 text-lg">
                <span>Background Removal (x{quantity})</span>
                <span className="font-medium">${backgroundRemovalSubtotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mt-2 text-lg">
              <span>Subtotal</span>
              <span className="font-medium">${subtotalBeforeShipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2 text-lg">
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
        </div>
        {/* --- End Column 2 --- */}

        {/* --- Column 3: Shipping and Payment Form (Span 2) --- */}
        <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 md:order-3 order-3 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Shipping Information</h2>
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
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
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
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
                className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                  className="mt-1 block w-full border border-purple-200 rounded-xl shadow-sm p-2 bg-white/70 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !stripe || isRemovingBackground}
              className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
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
                ) : (
                  `Pay $${totalPrice.toFixed(2)} ✨`
                )}
              </span>
            </button>
          </form>
        </div>
        {/* --- End Column 3 --- */}
      </div>
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
