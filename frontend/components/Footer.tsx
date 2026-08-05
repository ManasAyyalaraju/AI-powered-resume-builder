'use client';

import { Copy, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black bg-white mt-auto">
      <div className="container mx-auto px-6 md:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Copy className="w-7 h-7 text-black" strokeWidth={2.25} />
              <span className="text-[32px] font-bold text-black lowercase leading-none">refactr</span>
            </div>
            <p className="text-[24px] text-black">
              Built by <span className="font-bold">Manas Ayyalaraju</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ManasAyyalaraju"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 text-black hover:text-[#187fe7] transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/manas-ayyalaraju"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 text-black hover:text-[#187fe7] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

