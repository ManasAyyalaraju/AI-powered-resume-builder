# Auto Resume Tailor - Frontend

A modern Next.js frontend for the AI-Powered Resume Tailoring system.

## Features

- 🎨 Beautiful, responsive UI with Tailwind CSS
- 📤 Drag-and-drop file upload
- ⚡ Real-time validation
- 🌙 Dark mode support
- 📱 Mobile-friendly design
- ✨ Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend/README.md)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update the API URL in `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Landing page
│   ├── tailor/
│   │   └── page.tsx          # Main tailoring interface
│   ├── results/
│   │   └── page.tsx          # Results view
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Footer
│   ├── FileUpload.tsx        # Drag-drop upload
│   ├── JobDescriptionInput.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── lib/
│   ├── api.ts               # API client
│   └── utils.ts             # Utility functions
└── types/
    └── resume.ts            # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

## Usage

1. **Upload Resume**: Drag and drop or click to upload your PDF resume
2. **Paste Job Description**: Copy the complete job description
3. **Tailor**: Click "Tailor My Resume" and wait for processing
4. **Download**: Get your tailored resume as JSON or PDF

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` by default.

Endpoint used:
- `POST /api/tailor/pdf` - Upload resume and job description

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Contributing

Feel free to submit issues and pull requests!

## License

MIT License - see LICENSE file for details
