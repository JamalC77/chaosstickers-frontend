'use client';

import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/a894840a-2690-4f1f-9cfd-5b0c1c3e6285.png" 
            alt="ChaosStickers Logo" 
            width={50} 
            height={50} 
            className="mr-2"
          />
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                How It Works
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 