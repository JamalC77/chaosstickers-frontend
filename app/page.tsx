'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import RecentImages from './components/RecentImages';
import UserRecentDesigns from './components/UserRecentDesigns';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log('Storing prompt in localStorage:', prompt);
      // Store the prompt in localStorage to use it on the design page
      localStorage.setItem('userPrompt', prompt);
      
      // Clear any previously generated image from localStorage
      localStorage.removeItem('generatedImageUrl');
      
      // Add a small delay before navigating to ensure localStorage updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the design page
      router.push('/design');
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 z-10">
        <section className="w-full md:w-2/3 backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-2xl border border-white/60">
          <div className="text-center mb-8 relative">
            <div className="flex justify-center items-center mb-4">
              <Image 
                src="/a894840a-2690-4f1f-9cfd-5b0c1c3e6285.png" 
                alt="ChaosStickers Logo" 
                width={350} 
                height={200}
                className="mb-2" 
              />
            </div>
            <p className="text-xl font-medium text-gray-800">
              Let your imagination run wild & embrace the <span className="font-bold text-purple-800">chaos</span>!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <textarea
                className="w-full p-4 bg-white/70 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px] resize-none shadow-md transition-all duration-300 group-hover:shadow-lg"
                placeholder="Describe your wildest art ideas... (e.g., 'A magical fox with rainbow fur dancing under cosmic auroras')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="art-button w-full py-4 px-6 rounded-xl text-white font-bold focus:outline-none transition-all duration-300"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Magic...
                  </>
                ) : (
                  'Unleash My Creativity! ✨'
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-800 font-medium">
              Enter any idea, and our AI will transform it into a <span className="text-purple-800 font-bold">vibrant</span> sticker design!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <span className="inline-block px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">Magical</span>
              <span className="inline-block px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-sm font-medium">Colorful</span>
              <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">Creative</span>
              <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">Unique</span>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-gray-800 font-semibold">
                ✨ Design today, get <span className="text-purple-700 font-bold">real physical stickers</span> delivered to your door! ✨
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Premium vinyl stickers shipped within the US in 5-7 business days
              </p>
            </div>
          </div>
        </section>
        
        <aside className="w-full md:w-1/3 flex flex-col gap-6">
          <UserRecentDesigns />
          <RecentImages />
        </aside>
      </div>
    </main>
  );
} 