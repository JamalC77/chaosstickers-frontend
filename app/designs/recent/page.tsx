'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
// import { GeneratedImage } from '@prisma/client'; // --- REMOVED incorrect import ---

// Define the type locally based on expected API response structure
interface GeneratedImage {
  id: number;
  prompt: string;
  imageUrl: string;
  userId: string | null; // Based on schema 'String?'
  noBackgroundUrl: string | null; // Based on schema 'String?'
  hasRemovedBackground: boolean; // Based on schema 'Boolean'
  createdAt: string; // Date comes as string in JSON
  // Add other fields if the API sends them and they are needed
}

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
  // Read initial page from URL only once for initial state
  const initialPage = parseInt(searchParams?.get('page') || '1', 10);

  // Use the local GeneratedImage interface for state
  const [designs, setDesigns] = useState<GeneratedImage[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State now solely drives the displayed page
  const [currentPage, setCurrentPage] = useState(initialPage);

  const limit = 20; // Items per page

  // Effect to fetch data when currentPage changes
  useEffect(() => {
    const fetchRecentDesigns = async (page: number) => {
      setLoading(true);
      setError(null);
      // Construct the target URL for fetching AND navigation
      const targetUrl = `/designs/recent?page=${page}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const apiUrl = `${baseUrl}/api/designs/recent?page=${page}&limit=${limit}`;

      console.log(`[useEffect] Fetching page ${page} from: ${apiUrl}`);
      console.log(`[useEffect] Intending to navigate to: ${targetUrl}`); // Log intent

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch recent designs (status: ${response.status})`);
        }
        const data = await response.json();
        console.log("[useEffect] Data received:", data);

        // Directly set state, assuming API sends correct structure matching local type
        if (Array.isArray(data.designs)) {
             setDesigns(data.designs);
        } else {
             console.error("[useEffect] Received designs data is not an array:", data.designs);
             throw new Error("Received invalid data format for designs.");
        }
        setPagination(data.pagination || null);

        // Update URL only *after* successful fetch and state update seems imminent
        // This prevents URL changing if fetch fails, but might feel slightly delayed.
        // Alternatively, push URL immediately *before* fetch if preferred.
         if (window.location.pathname + window.location.search !== targetUrl) {
             console.log(`[useEffect] Pushing URL: ${targetUrl}`);
             router.push(targetUrl, { scroll: false });
         } else {
             console.log(`[useEffect] URL is already correct: ${targetUrl}`);
         }

      } catch (err: any) {
        console.error("[useEffect] Fetch error:", err);
        setError(err.message || 'An unknown error occurred');
        setDesigns([]); // Clear designs on error
        setPagination(null); // Clear pagination on error
      } finally {
        setLoading(false);
      }
    };

    // Fetch data for the current state page
    fetchRecentDesigns(currentPage);

    // Dependency array ensures this runs when currentPage changes
  }, [currentPage, limit, router]); // Removed other dependencies, focus on page change

  const handlePageChange = (newPage: number) => {
    console.log(`[handlePageChange] Called with newPage: ${newPage}. Current page: ${currentPage}. Total pages: ${pagination?.totalPages}`);
    // Basic validation
    if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
      // Update the state only if the page number is actually different
      if (newPage !== currentPage) {
          console.log(`[handlePageChange] Setting current page state to: ${newPage}`);
          setCurrentPage(newPage); // This state change triggers the useEffect above
      } else {
          console.log(`[handlePageChange] newPage (${newPage}) is same as currentPage (${currentPage}). Not setting state.`);
      }
    } else {
      console.log(`[handlePageChange] Page change blocked. newPage: ${newPage}, currentPage: ${currentPage}, totalPages: ${pagination?.totalPages}`);
    }
  };

  // Click handler similar to RecentImages component
  const handleImageClick = (design: GeneratedImage) => {
    console.log(`[handleImageClick] Storing data for design ID: ${design.id}`);
    // Store data needed for the '/design' page in localStorage
    localStorage.setItem('userPrompt', design.prompt);
    localStorage.setItem('generatedImageUrl', design.imageUrl);
    // Optionally store other needed data, like ID or noBackgroundUrl
    localStorage.setItem('generatedImageId', design.id.toString());
    if (design.noBackgroundUrl) {
        localStorage.setItem('noBackgroundUrl', design.noBackgroundUrl);
    } else {
        localStorage.removeItem('noBackgroundUrl'); // Clear if not present
    }

    // Navigate to the generic design page
    router.push('/design');
  };

  // Log state before rendering
  console.log(`[Render] currentPage: ${currentPage}, loading: ${loading}, design count: ${designs.length}, pagination:`, pagination);

  // The rendering logic remains largely the same inside this component
  return (
    <>
      {loading && <p>Loading recent designs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {designs.length > 0 ? (
              designs.map((design) => (
                <div
                    key={design.id}
                    className="aspect-square overflow-hidden rounded-lg border border-gray-200 cursor-pointer"
                    onClick={() => handleImageClick(design)}
                >
                  <Image
                      src={design.imageUrl}
                      alt={`Design ${design.id}`}
                      width={200}
                      height={200}
                      className="w-full h-auto object-cover transition-transform duration-200 hover:scale-105"
                      unoptimized
                      priority={true}
                  />
                </div>
              ))
            ) : (
              <p>No recent designs found for page {currentPage}.</p>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading} // Disable while loading
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination || currentPage === pagination.totalPages || loading} // Disable while loading
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