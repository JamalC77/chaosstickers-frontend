'use client';

import React, { useState, useEffect } from 'react';

const PurchasedDesignsPage = () => {
  const [designs, setDesigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Check localStorage for previously used email
  useEffect(() => {
    const storedEmail = localStorage.getItem('purchaseEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const fetchPurchasedDesigns = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/designs/purchased?email=${encodeURIComponent(userEmail)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch purchased designs');
      }
      const data = await response.json();
      setDesigns(data.designs || []);
      setSubmittedEmail(userEmail);
      // Save email for future visits
      localStorage.setItem('purchaseEmail', userEmail);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      fetchPurchasedDesigns(email.trim());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Purchased Designs</h1>

      {/* Email input form */}
      {!submittedEmail && (
        <form onSubmit={handleSubmit} className="mb-8 max-w-md">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Enter the email you used for your purchase:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'View Designs'}
            </button>
          </div>
        </form>
      )}

      {/* Show which email we're viewing */}
      {submittedEmail && (
        <div className="mb-6 flex items-center gap-4">
          <p className="text-gray-600">
            Showing designs for: <span className="font-medium">{submittedEmail}</span>
          </p>
          <button
            onClick={() => {
              setSubmittedEmail(null);
              setDesigns([]);
            }}
            className="text-purple-600 hover:text-purple-800 text-sm underline"
          >
            Change email
          </button>
        </div>
      )}

      {loading && <p>Loading purchased designs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && submittedEmail && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {designs.length > 0 ? (
            designs.map((imageUrl, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                <img 
                  src={imageUrl} 
                  alt={`Purchased Design ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500">No purchased designs found for this email.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchasedDesignsPage; 