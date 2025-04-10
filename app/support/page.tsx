export default function SupportPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden">
      {/* Optional: Add background blobs like other pages if desired */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-4xl z-10 backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-xl border border-white/60 mt-10">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
          Support
        </h1>
        <div className="text-lg text-gray-800 space-y-4">
          <p>
            If you encounter any issues with your order, have questions about our products, or need assistance with anything else, please don't hesitate to reach out to our support team.
          </p>
          <p>
            You can contact us directly via email at:
          </p>
          <p className="text-center font-semibold text-xl text-purple-700 mt-4">
            <a href="mailto:support@chaos-stickers.com" className="hover:underline">
              support@chaos-stickers.com
            </a>
          </p>
          <p>
            We aim to respond to all inquiries within 24-48 business hours. Thank you for choosing Chaos Stickers!
          </p>
        </div>
      </div>
    </main>
  );
} 