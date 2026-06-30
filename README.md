# HiringRight: AI-Powered Talent Sourcing & Ranking Engine

HiringRight is an enterprise-grade recruitment acceleration platform designed to surface high-priority candidates from deep talent pools. By combining the cognitive understanding of Gemini AI with custom-weighted heuristic ranking models, HiringRight analyzes complex job descriptions, extracts candidate credentials, and scores cognitive-cultural-technical fit with high precision.

---

## 🚀 Key Features

- **Multi-Dimensional Slider-Weighted Heuristics**: Fine-tune sourcing criteria across 5 configurable dimensions:
  - 🧠 **Semantic Matching**: Evaluates core concept relevance, transferrable skills, and cognitive overlap.
  - 🛠️ **Skill Correspondence**: Matches hard-technical tools and methodologies.
  - 💼 **Years of Experience**: Scores career progression and seniority.
  - ⚡ **Candidate Responsiveness**: Weights historically high-intent or active talent.
  - 🎯 **Feasibility & Compensation**: Aligning expectations and structural logistics.
- **Interactive Recruiter AI Copilot**: A side-by-side conversational assistant that answers real-time questions, recommends best-fit talent, drafts personalized outreach, and highlights candidate profiles.
- **Dynamic Job Templates**: Bootstrap searches instantly with preloaded industry templates (e.g., AI/ML Engineer, Full-Stack Developer, Product Manager, Data Scientist).
- **Automated CSV Generation**: An optimized compiler pipeline that slices, ranks, and logs the top 100 candidates into an accurate export file (`team_discovery_rankings.csv`).
- **Modern Responsive Design**: A high-contrast, fully fluid workspace engineered using React 19, Tailwind CSS, and smooth micro-animations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion (for interactive transitions)
- **Backend API**: Node.js, Express, Vercel Serverless Functions
- **AI Core**: `@google/genai` (Google Gemini Pro Model)
- **Data Engineering**: Node-fs automated candidate pipeline scripts

---

## 📂 Project Structure

```
├── api/                  # Vercel serverless API entry point
├── src/                  # Frontend codebase
│   ├── components/       # Custom React widgets (Modals, Copilot chat, etc.)
│   ├── data/             # Candidate database engine and local heuristics 
│   ├── main.tsx          # App mounting layer
│   └── App.tsx           # Primary recruiter interface workspace
├── server.ts             # Express server handling backend API & Gemini proxy
├── vercel.json           # Vercel routing configuration
├── package.json          # Dependency manifest
└── team_discovery_rankings.csv # Exported top 100 candidate ranking database
```

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd hiring-right
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`, rendering your Vite frontend with active backend API routing!

---

## 📊 Generating the Candidate Ranking Export

The project contains a built-in generator script (`generate_csv.js`) that ranks your talent pool against specified requirements and compiles the top 100 entries.

To generate or update your `team_discovery_rankings.csv` file locally:
```bash
# Run the node-fs generation script
node generate_csv.js
```
This produces an accurate ranking dataset with the following schema:
- `candidate_id`: Unique identifier
- `rank`: Relative position (1 to 100)
- `score`: Combined percentage ranking score
- `reasoning`: Cognitive matching breakdown

---

## ☁️ Vercel Deployment Guide

To deploy this project seamlessly to Vercel, follow these exact settings:

### 1. Sign Up on Vercel
- When prompted during signup, select **Hobby / Personal** (this tier is completely free, does not require a credit card, and supports full automated deployments from GitHub).

### 2. Import Project
- Connect your GitHub account, locate the `HiringRight` repository, and click **Import**.

### 3. Configure Project Settings
On the project configuration page, set the following parameters:
- **Framework Preset**: Select **Vite** (Vercel automatically detects and maps Vite's build settings).
- **Root Directory**: Keep as `./` (default).
- **Build and Output Settings**: Leave these as default (Vercel will use `npm run build` and output static files into `dist/` automatically).

### 4. Set Environment Variables
Open the **Environment Variables** accordion and add:
1. **Key**: `GEMINI_API_KEY`  
   **Value**: *[Your actual Gemini API Key starting with AIza...]*

### 5. Deploy
- Click **Deploy**. Vercel will build the frontend, mount your serverless functions under `/api`, and supply you with a live production URL!
