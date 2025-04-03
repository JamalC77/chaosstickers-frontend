'use client';

import React, { useState, useEffect } from 'react';

const PurchasedDesignsPage = () => {
  const [designs, setDesigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchasedDesigns = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API endpoint if different
        const response = await fetch('/api/designs/purchased'); 
        if (!response.ok) {
          throw new Error('Failed to fetch purchased designs');
        }
        const data = await response.json();
        setDesigns(data.designs || []);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedDesigns();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Purchased Designs</h1>

      {loading && <p>Loading purchased designs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
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
            <p>You haven't purchased any designs yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchasedDesignsPage; 