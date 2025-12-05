# Frontend Setup Guide

## ✅ What's Been Built

A complete, modern Next.js frontend for the Auto Resume Tailor application with:

### Features Implemented

- 🎨 **Beautiful Landing Page** with hero section, features, and call-to-action
- 📤 **Drag-and-Drop File Upload** with validation and visual feedback
- 📝 **Job Description Input** with character validation
- ⚡ **Real-time Processing** with loading states
- 📊 **Results Dashboard** with analytics and resume preview
- 🌙 **Dark Mode Support** (automatic based on system preference)
- 📱 **Fully Responsive** design for all screen sizes
- ✨ **Smooth Animations** and transitions

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: react-dropzone
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites

1. Node.js 18+ installed
2. Backend API running on port 8000

### Installation & Running

**Option 1: Using npm (Recommended)**

```powershell
cd frontend
npm run dev
```

**Option 2: Using the PowerShell script**

```powershell
cd frontend
.\start-dev.ps1
```

The frontend will start on **http://localhost:3000**

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Landing page
│   ├── tailor/
│   │   └── page.tsx          # Main tailoring interface
│   ├── results/
│   │   └── page.tsx          # Results view with analytics
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles and theme
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Footer with links
│   ├── FileUpload.tsx        # Drag-drop file upload
│   ├── JobDescriptionInput.tsx  # Job description textarea
│   ├── LoadingSpinner.tsx    # Loading state component
│   └── ErrorMessage.tsx      # Error display component
├── lib/
│   ├── api.ts               # API client for backend
│   └── utils.ts             # Utility functions
├── types/
│   └── resume.ts            # TypeScript interfaces
└── .env.local               # Environment variables
```

## 🎯 User Flow

1. **Landing Page** (`/`)

   - Hero section with value proposition
   - How it works (3-step process)
   - Features showcase
   - Call-to-action buttons

2. **Tailor Page** (`/tailor`)

   - **Left Column**: Upload resume PDF (drag-and-drop)
   - **Right Column**: Paste job description
   - **Submit Button**: Triggers AI tailoring
   - **Loading State**: Shows progress with spinner
   - **Error Handling**: Displays errors with retry option

3. **Results Page** (`/results`)
   - **Analytics Cards**: Skills, Experience, Projects, Education counts
   - **Download Options**: JSON format
   - **Resume Preview**: Full formatted resume display
   - **Start Over**: Return to tailor page

## 🔧 Configuration

### Environment Variables

Create or edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change the URL if your backend is running on a different port or host.

## 🎨 Design Highlights

### Color Scheme

- **Primary**: Blue (#0066CC) - Professional and trustworthy
- **Success**: Green (#10B981) - Positive feedback
- **Error**: Red (#EF4444) - Error states
- **Backgrounds**: Clean white/dark mode support

### Components

- Rounded corners for modern feel
- Subtle shadows for depth
- Smooth transitions (200ms)
- Custom scrollbar styling
- Loading animations with blur effects

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📝 API Integration

The frontend communicates with the FastAPI backend:

**Endpoint**: `POST /api/tailor/pdf`

**Request**:

- `pdf`: File (multipart/form-data)
- `jd_text`: String (job description)
- `output`: String ("json" or "pdf")

**Response**:

- JSON: Resume object
- PDF: Binary blob

## 🐛 Troubleshooting

### Frontend won't start

```powershell
# Make sure you're in the frontend directory
cd frontend

# Check if node_modules exists
ls node_modules

# If not, reinstall dependencies
npm install

# Try starting again
npm run dev
```

### Can't connect to backend

1. Check if backend is running: http://localhost:8000/docs
2. Verify `.env.local` has correct API URL
3. Check browser console for CORS errors
4. Ensure backend has CORS enabled for localhost:3000

### File upload not working

- Ensure file is PDF format
- Check file size (max 10MB)
- Verify backend is accessible
- Check browser console for errors

### Dark mode issues

- Dark mode is automatic based on system preference
- Check your OS dark mode settings
- Tailwind's `dark:` classes handle the theme

## 🚀 Production Deployment

### Build for Production

```powershell
cd frontend
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Deploy to Other Platforms

- **Netlify**: Use `npm run build` and deploy `out/` folder
- **AWS/Azure**: Use Docker or static hosting
- **Self-hosted**: Use PM2 or systemd

## 📦 Additional Features to Add (Optional)

1. **PDF Download from Results**

   - Currently only JSON download works
   - Need to store original file or re-process for PDF

2. **Resume History**

   - Save past tailored resumes in localStorage
   - Quick access to previous results

3. **Comparison View**

   - Side-by-side: Original vs. Tailored
   - Highlight changes

4. **Export Options**

   - DOCX format
   - Multiple PDF templates

5. **Authentication**
   - User accounts
   - Save resumes to cloud
   - Usage tracking

## 📚 Development Tips

### Hot Reload

- Next.js automatically reloads on file changes
- If it doesn't work, restart the dev server

### TypeScript Errors

```powershell
# Check for type errors
npm run build
```

### Styling

- Use Tailwind classes
- Check `globals.css` for custom styles
- Use `dark:` prefix for dark mode styles

### Adding New Pages

1. Create file in `app/` directory
2. Export default React component
3. Next.js automatically creates route

### Adding New Components

1. Create file in `components/` directory
2. Use TypeScript for props
3. Import and use in pages

## 🎉 Testing the Application

### Manual Testing Steps

1. **Start Backend** (in separate terminal):

   ```powershell
   cd backend
   .\.venv\Scripts\activate
   uvicorn app:app --reload
   ```

2. **Start Frontend**:

   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test Landing Page**:

   - Visit http://localhost:3000
   - Check all sections load
   - Click "Get Started" → should go to /tailor

4. **Test File Upload**:

   - Drag and drop a PDF
   - Click to browse
   - Try invalid file (should show error)
   - Try file > 10MB (should show error)

5. **Test Job Description**:

   - Paste text < 100 chars (should show warning)
   - Paste valid JD (should show success)

6. **Test Tailoring**:

   - Click "Tailor My Resume"
   - Should show loading spinner
   - Should navigate to /results after processing

7. **Test Results**:
   - Check analytics cards display
   - Check resume preview renders
   - Click "Download JSON" (should download)
   - Click "Start Over" (should go back to /tailor)

## 🤝 Contributing

Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Manas Ayyalaraju**
