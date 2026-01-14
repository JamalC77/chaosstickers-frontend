'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import RecentImages from './components/RecentImages';
import UserRecentDesigns from './components/UserRecentDesigns';

// List of wacky ideas
const wackyIdeas = [
  "A disco ball pineapple riding a unicycle made of breadsticks.",
  "Three squirrels in tiny business suits having a high-stakes acorn negotiation.",
  "A sentient cloud that rains glitter and complains about the weather.",
  "A cactus wearing sunglasses and playing an electric guitar.",
  "A flock of rubber ducks migrating south in V-formation.",
  "A steampunk teacup powered by lightning bugs.",
  "A chameleon trying to blend in with a Jackson Pollock painting.",
  "A sloth astronaut slowly planting a flag on a giant donut.",
  "An octopus librarian organizing books with all eight arms.",
  "A T-Rex struggling to use a smartphone with its tiny arms.",
  "A pizza slice surfing on a wave of melted cheese.",
  "A garden gnome leading a yoga class for confused earthworms.",
  "A toaster that launches toast into orbit.",
  "A fluffy kitten piloting a giant mech warrior suit.",
  "A talking banana peel giving existential advice.",
  "A group of penguins wearing sombreros and playing maracas.",
  "A giraffe trying to drink coffee from a tiny espresso cup.",
  "A marshmallow knight battling a dragon made of smoke.",
  "A sentient sock puppet performing Shakespeare.",
  "A robot chef that only cooks spaghetti with gummy worms.",
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);

    try {
      localStorage.setItem('userPrompt', prompt);
      localStorage.removeItem('generatedImageUrl');
      localStorage.removeItem('generatedImageId');
      localStorage.removeItem('noBackgroundUrl');
      localStorage.removeItem('hasRemovedBackground');
      localStorage.setItem('designIntent', 'generate');

      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/design');
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setIsLoading(false);
    }
  };

  const handleChaoticClick = () => {
    const randomIndex = Math.floor(Math.random() * wackyIdeas.length);
    setPrompt(wackyIdeas[randomIndex]);
  };

  return (
    <main className="min-h-screen">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Logo */}
          <div className="text-center mb-12">
            <Image
              src="/a894840a-2690-4f1f-9cfd-5b0c1c3e6285.png"
              alt="Creator Sticker Drops"
              width={300}
              height={200}
              className="mx-auto mb-4"
            />
            <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              The platform for creator sticker drops
            </p>
          </div>

          {/* Split Hero Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Creator Card */}
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl p-8 border border-white/60 hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">For Creators</h2>
              <p className="text-gray-600 mb-6">
                Launch collectible sticker drops in under 30 minutes. Your audience buys packs. We handle fulfillment.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Generate AI designs or upload your own
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  We handle printing & shipping
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Keep 80% of profits
                </li>
              </ul>
              <Link
                href="/creator/signup"
                className="block w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-center rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your First Drop
              </Link>
            </div>

            {/* Fan Card */}
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl p-8 border border-white/60 hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">For Fans</h2>
              <p className="text-gray-600 mb-6">
                Discover and collect unique sticker packs from your favorite creators. Build your collection!
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Exclusive creator designs
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pick your own pack
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track your collection
                </li>
              </ul>
              <Link
                href="/shop"
                className="block w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-center rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Explore Drops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Make Your Own Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Or Make Your Own Sticker</h2>
            <p className="text-gray-600">
              Not a creator? Use our AI to generate a custom sticker just for you!
            </p>
          </div>

          {!showGenerator ? (
            <div className="text-center">
              <button
                onClick={() => setShowGenerator(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create a Custom Sticker
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    className="w-full p-4 bg-white border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] resize-none shadow-sm"
                    placeholder="Describe your sticker idea... (e.g., 'A magical fox with rainbow fur dancing under cosmic auroras')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleChaoticClick}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transform transition duration-300 ease-in-out"
                  >
                    🎲 Random Idea
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 focus:outline-none transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Generate Sticker'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Recent Designs</h3>
              <UserRecentDesigns />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Creations</h3>
              <RecentImages />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works for Creators */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works for Creators</h2>
            <p className="text-gray-600">Launch your sticker drop in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Create Designs', desc: 'Generate AI stickers or upload your own art', icon: '🎨' },
              { step: 2, title: 'Build Your Drop', desc: 'Curate designs into a themed collection', icon: '📦' },
              { step: 3, title: 'Set Pack Options', desc: 'Configure pricing and pack sizes', icon: '💰' },
              { step: 4, title: 'Share & Earn', desc: 'Publish and share with your audience', icon: '🚀' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-purple-600 mb-1">Step {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/creator/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
            >
              Get Started as a Creator
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
