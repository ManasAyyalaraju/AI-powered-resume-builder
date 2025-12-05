'use client';

import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-600">
              Built by <span className="font-semibold text-gray-800">Manas Ayyalaraju</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              AI-Powered Resume Tailoring System
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ManasAyyalaraju"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/manas-ayyalaraju"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cyan-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

