'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Define types for the order data expected from the backend
interface OrderItem {
  id: number;
  printifyProductId: string;
  printifyVariantId: number;
  quantity: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  userId: number;
  printifyOrderId: string | null;
  stripePaymentId: string | null;
  status: string;
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingEmail: string | null;
  // Add other shipping fields if needed
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// Component that fetches and displays order data
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      console.error('No session_id found in URL');
      setError('Could not find order details. Session ID missing.');
      setLoading(false);
      return;
    }

    // Remove retry logic constants
    // const MAX_RETRIES = 3;
    // const RETRY_DELAY = 2000;

    // Simplified fetch function (no retry needed)
    const fetchConfirmedOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching confirmed order details for session_id: ${sessionId}`);
        // Call the new backend endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/order/confirm-and-fetch?sessionId=${sessionId}`);
        
        // No need for 404 retry logic here, backend handles waiting
        
        if (!response.ok) {
          const errorData = await response.json();
          // Handle specific error from backend polling timeout
          if (response.status === 404) {
             throw new Error(errorData.error || 'Order processing timed out. Please check back later or contact support.');
          }
          throw new Error(errorData.error || `Failed to fetch order: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received confirmed order data:', data);
        setOrder(data.order);
        localStorage.removeItem('generatedImageUrl');
        localStorage.removeItem('hasRemovedBackground');
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching confirmed order:', err);
        setError(err.message || 'An unexpected error occurred while fetching your order details.');
        setLoading(false);
      }
    };

    fetchConfirmedOrder(); // Start the fetch process

  }, [searchParams, router]);

  // Display loading state
  if (loading) {
    return (
      <div className="text-center">
        <svg className="animate-spin mx-auto h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-700">Loading your order details...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
        <h2 className="font-bold text-xl mb-2">Error Fetching Order</h2>
        <p>{error}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 art-button py-2 px-4 rounded-lg text-white font-bold focus:outline-none transition-all duration-300"
        >
           <span className="relative z-10">Go Home</span>
        </button>
      </div>
    );
  }

  // Display success state with order details
  return (
    <>
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-24 w-24 flex items-center justify-center mx-auto shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500">Success!</h1>
      <p className="text-gray-800 font-medium mb-8 text-lg">
        Your artistic creation is on its way to becoming a real sticker!
      </p>

      {/* Display the sticker image from the order item */}
      {order?.items?.[0]?.imageUrl && (
        <div className="relative h-[200px] w-full mb-8 border-2 border-purple-200/50 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
          <Image
            src={order.items[0].imageUrl}
            alt="Your sticker design"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      )}

      <div className="mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-green-200/50 shadow-md w-full">
        <h2 className="font-bold mb-3 text-green-800 text-lg">Order Details</h2>
        <div className="flex justify-between mb-2">
          <p className="text-gray-800 font-medium">Order Number:</p>
          {/* Display actual order ID */}
          <p className="text-purple-800 font-bold">{order?.id ? `CS-${order.id}` : 'N/A'}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p className="text-gray-800 font-medium">Status:</p>
          {/* Display actual order status */}
          <p className="text-green-600 font-bold capitalize">{order?.status || 'Unknown'}</p>
        </div>
        {order?.shippingEmail && (
           <div className="flex justify-between">
             <p className="text-gray-800 font-medium">Email:</p>
             <p className="text-gray-700 font-medium">{order.shippingEmail}</p>
           </div>
        )}
         {/* Add more details as needed (e.g., shipping address) */}
      </div>

      <button
        onClick={() => router.push('/')}
        className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300"
      >
        <span className="relative z-10">Create Another Masterpiece ✨</span>
      </button>
    </>
  );
}

// Main page component wraps the content in Suspense
export default function ConfirmationPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-2xl z-10 border border-white/60 text-center">
        {/* Wrap the part that uses useSearchParams in Suspense */}
        <Suspense fallback={<div>Loading confirmation...</div>}>
          <ConfirmationContent />
        </Suspense>
      </div>
    </main>
  );
} 