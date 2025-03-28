'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function CheckoutPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
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
  const router = useRouter();

  useEffect(() => {
    // Get the image URL from localStorage
    const storedImageUrl = localStorage.getItem('generatedImageUrl');
    if (!storedImageUrl) {
      router.push('/');
      return;
    }

    setImageUrl(storedImageUrl);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the backend API to create a payment intent
      const response = await fetch('http://localhost:3001/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ imageUrl, quantity: 1 }],
          userId: 1, // For demo purposes, we're using a fixed userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);

      // For demo purposes, let's simulate a successful payment
      handleOrderSuccess('demo-payment-id');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setLoading(false);
    }
  };

  const handleOrderSuccess = async (paymentId: string) => {
    try {
      // Call the backend API to create an order
      const response = await fetch('http://localhost:3001/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
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
          selectedImageUrl: imageUrl,
          userId: 1, // For demo purposes, we're using a fixed userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      // Navigate to the confirmation page
      router.push('/confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">Complete Your Order</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Preview */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60 space-y-4">
            <h2 className="text-2xl font-bold text-purple-800">Your Amazing Sticker</h2>
            <div className="relative h-[300px] w-full border-2 border-purple-200/50 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Your sticker design"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              )}
            </div>
            <div className="border-t border-purple-200/50 pt-4">
              <h3 className="font-bold text-xl text-purple-800">Order Summary</h3>
              <div className="flex justify-between mt-3 text-lg">
                <span>Custom Sticker</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex justify-between mt-2 text-lg">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between mt-3 text-xl font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$10.00</span>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-2xl shadow-xl border border-white/60">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-purple-900">
                    State/Province
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
                disabled={loading}
                className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300 mt-6"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Purchase ✨'
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 