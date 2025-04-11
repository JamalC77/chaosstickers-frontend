'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const updateCartCount = () => {
    const storedItemsString = localStorage.getItem('checkoutItems');
    if (storedItemsString) {
      try {
        const parsedItems = JSON.parse(storedItemsString);
        if (Array.isArray(parsedItems)) {
          setCartItemCount(parsedItems.length);
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error('Failed to parse checkoutItems for navigation count:', error);
        setCartItemCount(0);
      }
    } else {
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateCartCount();

      const handleStorageChange = (event: StorageEvent) => {
        // Check if the key is 'checkoutItems' before updating
        if (event.key === 'checkoutItems' || event.key === null) { // null check for manual dispatch
            updateCartCount();
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // Add resize listener to close mobile menu on larger screens
      const handleResize = () => {
        if (window.innerWidth >= 768) { // Tailwind's `md` breakpoint
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener('resize', handleResize);


      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('resize', handleResize); // Cleanup resize listener
      };
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to close mobile menu on link click
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={handleMobileLinkClick}>
          <Image 
            src="/a894840a-2690-4f1f-9cfd-5b0c1c3e6285.png" 
            alt="ChaosStickers Logo" 
            width={50} 
            height={50} 
            className="mr-2"
          />
        </Link>

        {/* Desktop Navigation (Hidden on Small Screens) */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Left-aligned desktop links */}
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/business" className="text-gray-600 hover:text-blue-600 transition-colors">
                Business
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                Support
              </Link>
            </li>
          </ul>
           {/* Right-aligned desktop links */}
           <ul className="flex space-x-6 items-center">
             <li>
              <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/designs/recent" className="text-gray-600 hover:text-blue-600 transition-colors">
                Recent Designs
              </Link>
            </li>
            <li>
              {/* Cart Icon - Desktop */}
              <Link href="/checkout" passHref legacyBehavior>
                 <a className="relative inline-flex items-center p-2 text-sm font-medium text-center text-gray-700 hover:text-blue-600 transition-colors group">
                    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.121-4.7 0-7H8.25a9.06 9.06 0 00-1.753-.75M2.25 3L3.105 7.158A.75.75 0 003.84 8h16.32M4.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                    <span className="sr-only">Cart</span>
                    {cartItemCount > 0 && (
                    <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-2 dark:border-gray-200 group-hover:scale-110 transition-transform">
                        {cartItemCount}
                    </div>
                    )}
                </a>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button (Visible on Small Screens) */}
        <div className="md:hidden flex items-center">
           {/* Cart Icon - Mobile (Always Visible Next to Hamburger) */}
           <Link href="/checkout" passHref legacyBehavior>
              <a className="relative inline-flex items-center p-2 mr-2 text-sm font-medium text-center text-gray-700 hover:text-blue-600 transition-colors group">
                 <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.121-4.7 0-7H8.25a9.06 9.06 0 00-1.753-.75M2.25 3L3.105 7.158A.75.75 0 003.84 8h16.32M4.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                 </svg>
                 <span className="sr-only">Cart</span>
                 {cartItemCount > 0 && (
                 <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-1 -right-2 dark:border-gray-200 group-hover:scale-110 transition-transform">
                     {cartItemCount}
                 </div>
                 )}
             </a>
           </Link>
           {/* Hamburger Button */}
           <button 
            onClick={toggleMobileMenu} 
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Conditionally Rendered) */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4">
          <ul className="flex flex-col items-center space-y-4">
             <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={handleMobileLinkClick}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/business" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={handleMobileLinkClick}>
                  Business
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={handleMobileLinkClick}>
                  Support
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={handleMobileLinkClick}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/designs/recent" className="text-gray-600 hover:text-blue-600 transition-colors" onClick={handleMobileLinkClick}>
                  Recent Designs
                </Link>
              </li>
              {/* Cart Link in Mobile Menu */}
              <li>
                  <Link href="/checkout" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" onClick={handleMobileLinkClick}>
                    Cart
                    {cartItemCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {cartItemCount}
                        </span>
                    )}
                 </Link>
              </li>
          </ul>
        </nav>
      )}
    </header>
  );
} 