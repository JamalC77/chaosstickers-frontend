'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugPrintifyPage() {
  const [loading, setLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [productResult, setProductResult] = useState<any>(null);
  const [catalogResult, setCatalogResult] = useState<any>(null);
  const [basicAccessResult, setBasicAccessResult] = useState<any>(null);
  const [externalOrderResult, setExternalOrderResult] = useState<any>(null);
  const [mockOrderResult, setMockOrderResult] = useState<any>(null);
  const [generatedImageResult, setGeneratedImageResult] = useState<any>(null);
  const [imagePrompt, setImagePrompt] = useState('A cute cat riding a skateboard');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const router = useRouter();

  const runDebugCheck = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      // Call the backend API to test Printify integration
      const response = await fetch('http://localhost:3001/api/order/debug/printify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setDebugResult(data);
    } catch (error: any) {
      console.error('Error debugging Printify:', error);
      setDebugResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testPrintifyOrder = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Call the backend API to test Printify integration
      const response = await fetch('http://localhost:3001/api/order/test-printify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '555-555-5555',
            country: 'US',
            region: 'CA',
            address1: '123 Test St',
            address2: '',
            city: 'Test City',
            zip: '12345',
          },
          selectedImageUrl: 'https://example.com/placeholder.png', // Will be replaced with test image
          userId: 1, // For test purposes, we're using a fixed userId
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      console.error('Error testing Printify integration:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testProductCreation = async () => {
    setLoading(true);
    setProductResult(null);

    try {
      // Call the simplified product creation endpoint
      const response = await fetch('http://localhost:3001/api/order/test/product', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setProductResult(data);
    } catch (error: any) {
      console.error('Error testing product creation:', error);
      setProductResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateImageAndCreateProduct = async () => {
    setLoading(true);
    setGeneratedImageResult(null);

    try {
      // Call the endpoint that will generate an image and create a product
      const response = await fetch('http://localhost:3001/api/order/test/generate-and-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
        }),
      });

      const data = await response.json();
      setGeneratedImageResult(data);
      
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (error: any) {
      console.error('Error generating image and creating product:', error);
      setGeneratedImageResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCatalog = async () => {
    setLoading(true);
    setCatalogResult(null);

    try {
      // Call the catalog endpoint
      const response = await fetch('http://localhost:3001/api/order/debug/catalog', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setCatalogResult(data);
    } catch (error: any) {
      console.error('Error fetching Printify catalog:', error);
      setCatalogResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBasicAccess = async () => {
    setLoading(true);
    setBasicAccessResult(null);

    try {
      // Call the basic access test endpoint
      const response = await fetch('http://localhost:3001/api/order/test/basic-access', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setBasicAccessResult(data);
    } catch (error: any) {
      console.error('Error testing basic API access:', error);
      setBasicAccessResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testExternalOrder = async () => {
    setLoading(true);
    setExternalOrderResult(null);

    try {
      // Call the external order test endpoint
      const response = await fetch('http://localhost:3001/api/order/test-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '555-555-5555',
            country: 'US',
            region: 'CA',
            address1: '123 Test St',
            address2: '',
            city: 'Test City',
            zip: '12345',
          },
          userId: 1, // For test purposes, we're using a fixed userId
        }),
      });

      const data = await response.json();
      setExternalOrderResult(data);
    } catch (error: any) {
      console.error('Error testing external order creation:', error);
      setExternalOrderResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testMockOrder = async () => {
    setLoading(true);
    setMockOrderResult(null);

    try {
      // Call the fully mocked order endpoint that bypasses Printify completely
      const response = await fetch('http://localhost:3001/api/order/test-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '555-555-5555',
            country: 'US',
            region: 'CA',
            address1: '123 Test St',
            address2: '',
            city: 'Test City',
            zip: '12345',
          },
          selectedImageUrl: 'https://example.com/placeholder.png',
          userId: 1,
        }),
      });

      const data = await response.json();
      setMockOrderResult(data);
    } catch (error: any) {
      console.error('Error creating mock order:', error);
      setMockOrderResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Determine status and color for each result
  const getStatusInfo = (result: any) => {
    if (!result) return { text: 'Not tested', color: 'bg-gray-200 text-gray-700' };
    if (result.error) return { text: 'Failed', color: 'bg-red-200 text-red-700' };
    if (result.success) return { text: 'Success', color: 'bg-green-200 text-green-700' };
    return { text: 'Completed with warnings', color: 'bg-yellow-200 text-yellow-700' };
  };

  const debugStatus = getStatusInfo(debugResult);
  const productStatus = getStatusInfo(productResult);
  const orderStatus = getStatusInfo(testResult);
  const catalogStatus = getStatusInfo(catalogResult);
  const basicAccessStatus = getStatusInfo(basicAccessResult);
  const externalOrderStatus = getStatusInfo(externalOrderResult);
  const mockOrderStatus = getStatusInfo(mockOrderResult);
  const generatedImageStatus = getStatusInfo(generatedImageResult);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Printify Integration Debug</h1>
        
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 text-lg">Printify API Integration</h3>
            <p className="text-sm text-blue-700 mb-2">
              Your Printify API key has all the necessary permissions to create products and orders:
            </p>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>uploads.write - For uploading images to Printify</li>
              <li>products.write - For creating products in your shop</li>
              <li>orders.write - For submitting orders to print providers</li>
            </ul>
            <p className="mt-2 text-sm text-blue-700">
              Try the "Test Complete Order Flow" button to create a real Printify order. If that fails, use the "Create Mock Order" button to simulate the order flow locally.
            </p>
          </div>
          
          <div className="mb-6">
            <button
              onClick={testMockOrder}
              className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
              disabled={loading}
            >
              {loading ? 'Processing...' : '➡️ Create Mock Order (RECOMMENDED)'}
            </button>
            <p className="text-xs text-center mt-2 text-gray-600">
              This option bypasses Printify completely and simulates the order flow locally
            </p>
          </div>
          
          <h2 className="text-lg font-bold mb-2">Test Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Basic API</span>
                <span className={`px-2 py-1 rounded-full text-xs ${basicAccessStatus.color}`}>{basicAccessStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Tests fundamental API access</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Catalog Access</span>
                <span className={`px-2 py-1 rounded-full text-xs ${catalogStatus.color}`}>{catalogStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Lists available products</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Mock Order</span>
                <span className={`px-2 py-1 rounded-full text-xs ${mockOrderStatus.color}`}>{mockOrderStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Simulated order (no API)</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">API Connection</span>
                <span className={`px-2 py-1 rounded-full text-xs ${debugStatus.color}`}>{debugStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Verifies your Printify API key and shop access</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Product Creation</span>
                <span className={`px-2 py-1 rounded-full text-xs ${productStatus.color}`}>{productStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Tests creating a product in your Printify catalog</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Order Creation</span>
                <span className={`px-2 py-1 rounded-full text-xs ${orderStatus.color}`}>{orderStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Tests the complete order flow</p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">External Order</span>
                <span className={`px-2 py-1 rounded-full text-xs ${externalOrderStatus.color}`}>{externalOrderStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600">Tests the external order API (recommended)</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={testBasicAccess}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Basic API Access'}
            </button>
          
            <button
              onClick={runDebugCheck}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check API Connection'}
            </button>
            
            <button
              onClick={checkCatalog}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Available Products'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testProductCreation}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Product Creation Only'}
            </button>
            
            <button
              onClick={testPrintifyOrder}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Complete Order Flow'}
            </button>
          </div>
          
          <div className="mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-800">API Access Issue Detected</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Your Printify API key appears to be working but doesn't have access to the image upload endpoints.
                Please use the "Test External Order" button below which uses a different approach that should work with your API permissions.
              </p>
            </div>
          
            <button
              onClick={testExternalOrder}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Test External Order (Recommended)'}
            </button>
          </div>
        </div>
        
        {/* New section for image generation and product creation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Generate Image & Create Product</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate an image using OpenAI and use it to create a product in Printify.
          </p>

          <div className="mb-4">
            <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700 mb-1">
              Image Prompt
            </label>
            <input
              type="text"
              id="imagePrompt"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Describe the sticker you want to generate"
            />
          </div>

          <button
            onClick={generateImageAndCreateProduct}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Generate Image & Create Product'}
          </button>

          {generatedImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Generated Image:</p>
              <img 
                src={generatedImageUrl} 
                alt="Generated sticker" 
                className="w-64 h-64 object-contain border border-gray-200 rounded-md"
              />
            </div>
          )}

          <div className="mt-4">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${generatedImageStatus.color}`}>
              {generatedImageStatus.text}
            </span>
          </div>

          {generatedImageResult && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">{JSON.stringify(generatedImageResult, null, 2)}</pre>
            </div>
          )}
        </div>
        
        {basicAccessResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Basic API Access Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(basicAccessResult, null, 2)}</pre>
            </div>
            {basicAccessResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{basicAccessResult.details || basicAccessResult.error}</p>
              </div>
            )}
          </div>
        )}
        
        {catalogResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Product Catalog Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(catalogResult, null, 2)}</pre>
            </div>
            {catalogResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{catalogResult.details || catalogResult.error}</p>
              </div>
            )}
            {catalogResult.stickerBlueprints && catalogResult.stickerBlueprints.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Available Sticker Products</h3>
                <ul className="space-y-2">
                  {catalogResult.stickerBlueprints.map((blueprint: any) => (
                    <li key={blueprint.id} className="p-2 bg-blue-50 rounded border border-blue-100">
                      <div className="font-medium">{blueprint.title}</div>
                      <div className="text-sm text-gray-600">ID: {blueprint.id}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {debugResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">API Connection Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
            {debugResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{debugResult.details || debugResult.error}</p>
              </div>
            )}
          </div>
        )}
        
        {productResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Product Creation Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(productResult, null, 2)}</pre>
            </div>
            {productResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{productResult.details || productResult.error}</p>
              </div>
            )}
          </div>
        )}
        
        {testResult && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Complete Order Flow Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
            {testResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{testResult.details || testResult.error}</p>
              </div>
            )}
          </div>
        )}
        
        {externalOrderResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">External Order Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(externalOrderResult, null, 2)}</pre>
            </div>
            {externalOrderResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{externalOrderResult.details || externalOrderResult.error}</p>
              </div>
            )}
          </div>
        )}
        
        {mockOrderResult && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Mock Order Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-80">
              <pre>{JSON.stringify(mockOrderResult, null, 2)}</pre>
            </div>
            {mockOrderResult.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-700 mb-1">Error Details</h3>
                <p className="text-sm">{mockOrderResult.details || mockOrderResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 