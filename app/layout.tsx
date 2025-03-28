import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChaosStickers - Custom AI-Generated Stickers",
  description: "Create and order custom AI-generated stickers in seconds!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <footer className="bg-gray-100 p-6 mt-auto">
          <div className="container mx-auto text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} ChaosStickers. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 