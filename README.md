# Pinch - AI-Powered Visual Discovery Engine

![Pinch Banner](Will update soon)

**Pinch** is a next-generation social platform that combines the visual curation of Pinterest with the power of Generative AI and Semantic Search. Unlike traditional galleries that rely on manual tagging, Pinch uses a **Hybrid Recommendation Engine** powered by Google Gemini and Vector Embeddings to understand the "vibe" of content, not just keywords.

## 🚀 Key Features

### 🧠 AI & Intelligence
* **Generative Creation:** Integrated **Pollinations.ai (Flux Model)** to allow users to generate photorealistic images from text prompts directly within the app.
* **Auto-Categorization:** Uses **Google Gemini 1.5 Flash** to analyze uploaded images and automatically generate semantic tags (e.g., "Cyberpunk," "Minimalist") and descriptions.
* **Visual Search ("Vibe Check"):** Implemented **MongoDB Atlas Vector Search** to find "visually similar" pins based on 768-dimensional vector embeddings, enabling discovery beyond text matching.
* **Hybrid Recommendation Algo:** A custom behavioral tracking engine that scores user interests based on Views (+1) and Saves (+5) to curate a personalized feed.

### ⚡ Engineering & Performance
* **Semantic Search:** Replaced standard Regex search with **Atlas Search (Lucene)** for typo-tolerance and autocomplete.
* **Optimized Frontend:** Built with **React + Vite**, utilizing Route-based code splitting and lazy loading to ensure sub-second load times.
* **Modern UI/UX:** Features a responsive Masonry layout, optimistic UI updates, and accessible components using **Radix UI** and **Tailwind CSS**.
* **Security:** Implemented **Joi** validation middleware for robust server-side input sanitization and password complexity enforcement.

## 🛠️ Tech Stack

**Frontend**
* React 19 (Vite)
* Tailwind CSS + Shadcn/ui
* TanStack Query (React Query)
* Framer Motion
* React Masonry CSS

**Backend**
* Node.js & Express
* MongoDB Atlas (Vector & Search Indexes)
* Cloudinary (Image Optimization & Storage)
* Passport.js (Authentication)
* Google Gemini API (Vision & Embeddings)

## ⚙️ Local Setup

### Prerequisites
* Node.js v18+
* MongoDB Atlas Account
* Cloudinary Account
* Google AI Studio Key

### 1. Clone & Install
In bash:
git clone [https://github.com/DataWiseWizard/Pinch.git]
cd pinch

#### Install Server Dependencies
cd server
npm install

#### Install Client Dependencies
cd ../client
npm install

### 2. Environment Variables
Create a .env file in the server directory:
# Database
ATLASDB_URL=mongodb+srv://...
SECRET=your_session_secret

#### Cloudinary
CLOUD_NAME=...
CLOUD_API_KEY=...
CLOUD_API_SECRET=...

#### AI Services
GEMINI_API_KEY=...

#### App Config
CLIENT_URL=http://localhost:5173
NODE_ENV=development

### 3. Run the Application
You need two terminals:
Terminal 1 (Server):
cd server
npm start

Terminal 2 (Client):
cd client
npm run dev

## 🧪 Architecture
graph TD
    User[User] -->|Uploads Image| Client[React Client]
    Client -->|Multipart Data| Server[Express API]
    Server -->|Stream Upload| Cloudinary[Cloudinary]
    Server -->|Analyze Image| Gemini[Google Gemini AI]
    Gemini -->|Tags & Vector| Server
    Server -->|Save Metadata| DB[(MongoDB Atlas)]
    
    User -->|Search 'Neon'| Client
    Client -->|Query| Server
    Server -->|Vector Search| DB
    DB -->|Semantic Results| Client

## 🛡️ Security
Data Privacy: User interest profiles are siloed and only accessible via authenticated endpoints.

Validation: All write operations are validated using Joi schemas to prevent injection and data corruption.

Authentication: Secure session management via HttpOnly cookies.

**Build By: Rudraksha Kumbhkar**
