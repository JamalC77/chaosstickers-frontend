'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// New inner component marked as client component
const RecentDesignsGrid = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read initialPage inside the component that uses it
  const initialPage = parseInt(searchParams?.get('page') || '1', 10);

  const [designs, setDesigns] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize currentPage state directly
  const [currentPage, setCurrentPage] = useState(initialPage);

  const limit = 20; // Items per page

  useEffect(() => {
    // Update URL query param when page changes
    // No need to compare with initialPage here, let the state drive the fetch
    router.push(`/designs/recent?page=${currentPage}`, { scroll: false });

    const fetchRecentDesigns = async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/designs/recent?page=${page}&limit=${limit}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch recent designs');
        }
        const data = await response.json();
        setDesigns(data.designs || []);
        setPagination(data.pagination || null);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDesigns(currentPage);

    // Dependency array includes currentPage to refetch when it changes
  }, [currentPage, limit, router]);

  // Update currentPage state if the URL param changes externally (e.g., back button)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams?.get('page') || '1', 10);
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams, currentPage]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      setCurrentPage(newPage); // This will trigger the useEffect to fetch and update URL
    }
  };

  // The rendering logic remains largely the same inside this component
  return (
    <>
      {loading && <p>Loading recent designs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {designs.length > 0 ? (
              designs.map((imageUrl, index) => (
                <div key={`${currentPage}-${index}`} className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={imageUrl}
                    alt={`Recent Design ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <p>No recent designs found.</p>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination || currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};


// The main page component - can potentially be a Server Component now,
// but keeping 'use client' is fine too if other client interactions are needed later.
// For simplicity, we remove 'use client' here and add it to the inner component.
// Remove 'use client' from the top if this becomes the only export.


const RecentDesignsPage = () => {
  // Remove state and hooks from the outer component
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Most Recent Designs</h1>
      {/* Wrap the component using searchParams in Suspense */}
      <Suspense fallback={<div className="text-center">Loading designs...</div>}>
        <RecentDesignsGrid />
      </Suspense>
    </div>
  );
};

export default RecentDesignsPage; 