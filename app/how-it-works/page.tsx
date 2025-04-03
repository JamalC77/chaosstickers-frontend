import Link from 'next/link';

export default function HowItWorks() {
  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        How ChaosStickers Work
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-12">
        <section className="bg-white/70 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-purple-600">1</span>
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-purple-800 mb-3">Describe Your Idea</h2>
              <p className="text-gray-700">
                Start by entering a detailed description of your sticker idea. Let your imagination run wild! 
                The more specific you are, the better the AI can create exactly what you want.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/70 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-pink-600">2</span>
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-pink-800 mb-3">AI Generates Your Design</h2>
              <p className="text-gray-700">
                Our advanced AI transforms your idea into beautiful, vibrant sticker art.
                It analyzes your description and creates a unique design that captures the essence of your imagination.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/70 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">3</span>
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-blue-800 mb-3">Preview Your Sticker</h2>
              <p className="text-gray-700">
                See exactly how your sticker will look before you buy. You can make try different ideas until you find the perfect design that speaks to you.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/70 p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-yellow-600">4</span>
              </div>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-yellow-800 mb-3">Order & Receive Real Physical Stickers</h2>
              <p className="text-gray-700">
                When you&apos;re satisfied with your design, simply place your order. 
                We&apos;ll print your custom stickers on premium vinyl material and 
                ship them directly to your door. You&apos;ll receive real, high-quality physical stickers 
                that you can use anywhere!
              </p>
              <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Delivery details:</span> Orders typically ship within 2-3 business days
                  and arrive within 5-7 days depending on your location. Currently shipping to US addresses only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="text-center mt-16">
        <Link href="/" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
          Create Your Sticker Now!
        </Link>
      </div>
    </main>
  );
} 