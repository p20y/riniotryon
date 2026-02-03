# Virtual Try-On Web App

A premium-looking web application that allows users to upload their photo, select a clothing style, and generate a personalized look using AI.

## ✨ Features

- **📸 Dual Capture Modes**: Upload an existing photo or capture one directly using your camera.
- **🎨 Style Selection**: Choose from a curated list of styles (T-shirt, Jacket, Dress, Hoodie).
- **⚡ Fast & Responsive**: Built with React & Vite for optimal performance.
- **🤖 AI Integration**: Backend structure ready for AI Image Generation (currently using high-quality mocks).
- **💎 Premium UI**: Glassmorphism design with smooth animations.

## 🛠 Tech Stack

- **Frontend**: React, Vite, CSS Modules (Premium Custom Styling)
- **Backend**: Python, FastAPI
- **Services**: Supabase (Auth & Storage - *Configuration Ready*)
- **Deployment**: Vercel / Railway (Recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)

### 1. specific Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Access the app at `http://localhost:5173`

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
App API runs at `http://localhost:8000`

## 🔮 Roadmap

- [ ] Integrate Real AI Model (Replicate / Flux)
- [ ] Add User Authentication with Supabase
- [ ] Implement "Email My Look" feature
- [ ] Mobile Responsive Polish

## 📄 License

MIT
