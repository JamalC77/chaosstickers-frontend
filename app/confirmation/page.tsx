'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ConfirmationPage() {
  const [imageUrl, setImageUrl] = useState('');
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-2xl z-10 border border-white/60 text-center">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-24 w-24 flex items-center justify-center mx-auto shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500">Success!</h1>
        <p className="text-gray-800 font-medium mb-8 text-lg">
          Your artistic creation is on its way to becoming a real sticker!
        </p>

        {imageUrl && (
          <div className="relative h-[200px] w-full mb-8 border-2 border-purple-200/50 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
            <Image
              src={imageUrl}
              alt="Your sticker design"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        )}

        <div className="mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-green-200/50 shadow-md">
          <h2 className="font-bold mb-3 text-green-800 text-lg">Order Details</h2>
          <div className="flex justify-between mb-2">
            <p className="text-gray-800 font-medium">Order Number:</p>
            <p className="text-purple-800 font-bold">ORD-12345</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-800 font-medium">Status:</p>
            <p className="text-green-600 font-bold">Processing</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300"
        >
          <span className="relative z-10">Create Another Masterpiece ✨</span>
        </button>
      </div>
    </main>
  );
} 