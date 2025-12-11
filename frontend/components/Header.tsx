'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-gray-800">JobCraft</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/tailor" 
              className="text-gray-600 hover:text-cyan-600 font-medium transition-colors"
            >
              Get Started
            </Link>
            <a 
              href="https://github.com/ManasAyyalaraju/AI-powered-resume-builder" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-600 font-medium transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
