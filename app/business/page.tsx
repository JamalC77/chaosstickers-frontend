import React from 'react';

export default function BusinessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 md:p-12 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Let's Grow Together!</h1>
        <p className="text-xl md:text-2xl mb-8 text-indigo-700 font-medium">Partner with Chaos Stickers for Your Business Needs</p>

        <div className="max-w-3xl mx-auto text-left space-y-6 text-lg text-gray-800">
          <p>
            Unlock the power of custom stickers for your brand! At Chaos Stickers, we're passionate about collaborating with businesses like yours. Whether you need eye-catching stickers for events, unique designs for resale, or custom creations for special projects, we're your dedicated partner.
          </p>
          <p>
            Our mission is to empower your business with high-quality, AI-generated stickers that capture attention and make a lasting impression. Let's turn your vision into vibrant reality!
          </p>
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">Ready to Collaborate?</h2>
            <p className="mb-4">
              For bulk orders, general inquiries, or exciting partnership opportunities, our expert sales team is ready to assist:
            </p>
            <a 
              href="mailto:sales@chaos-stickers.com" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors duration-300 text-lg"
            >
              Contact Sales Team
            </a>
          </div>
          <p className="mt-8 pt-4 border-t border-indigo-200">
            We're excited to hear from you and explore how Chaos Stickers can elevate your business.
          </p>
        </div>
      </div>
    </div>
  );
} 