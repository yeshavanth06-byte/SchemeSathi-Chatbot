# 🇮🇳 SchemeSathi – AI Government Scheme Assistant

SchemeSathi is an AI-powered conversational web application designed to help Indian citizens discover, understand, and apply for Central and State government welfare schemes.

---

## 🌟 Key Features

### 1. Conversational AI Chatbot
- **Natural Citizen Interaction**: Greets citizens warmly (e.g., Namaste, Pranam, Hello) and understands queries in plain language.
- **One-at-a-Time Eligibility Assessment**: Instead of complex multi-page forms, SchemeSathi walks users through eligibility questions conversationally (State → Age → Occupation → Education → Family Income → Special Category).
- **Match Rationale**: Explains specifically *why* each recommended scheme matches the citizen's profile.
- **Natural Language Parsing**: Understands combined inputs (e.g., *"I am a 22-year-old student from Uttar Pradesh with family income 2 Lakh"*).

### 2. Comprehensive Scheme Database (Central & State)
- **Central Government Programs**: PM-KISAN, Ayushman Bharat PM-JAY, PM Mudra Yojana, PMAY-G, PMAY-U, Sukanya Samriddhi Yojana, PM Vishwakarma, Atal Pension Yojana, PM SVANidhi, PM Matru Vandana, PM Ujjwala, National Scholarship Portal (NSP), PM Surya Ghar Muft Bijli, PM Fasal Bima, Kisan Credit Card (KCC), PM Jeevan Jyoti, PM Suraksha Bima, Lakhpati Didi, PM-GKAY, IGNOAPS Old Age Pension, PM Vidya Lakshmi, PM Kaushal Vikas Yojana.
- **State Government Programs**:
  - **Maharashtra**: Mukhyamantri Majhi Ladki Bahin Yojana (₹1,500/mo)
  - **Karnataka**: Gruha Lakshmi Scheme (₹2,000/mo), Yuva Nidhi Scheme (₹3,000/mo)
  - **Madhya Pradesh**: Ladli Behna Yojana (₹1,250/mo), Mukhyamantri Kisan Kalyan Yojana (₹6,000/yr top-up)
  - **Tamil Nadu**: Kalaignar Magalir Urimai Thogai (₹1,000/mo)
  - **Uttar Pradesh**: Mukhyamantri Kanya Sumangala Yojana (₹25,000 grant)
  - **Odisha**: KALIA Scheme (₹10,000/yr)
  - **West Bengal**: Kanyashree Prakalpa (₹25,000 grant), Lakshmir Bhandar (₹1,000-1,200/mo)
- **Every Scheme Provides**:
  - Scheme Name & Tagline
  - Key Financial & Healthcare Benefits
  - Detailed Eligibility Rules
  - Interactive Required Documents Checklist (with file size guidelines)
  - Step-by-step Application Guide
  - Verified Official Portal (`.gov.in` / `.nic.in`)
  - Official Toll-Free Helpline Numbers

### 3. Official Application Assistance & Troubleshooting
- **Aadhaar OTP Failures**: Explains UIDAI phone linking, DND filters, mobile recharge validity, and server peak hours.
- **DBT & NPCI Bank Seeding**: Clearly clarifies the critical difference between normal bank KYC and Aadhaar NPCI DBT seeding, with instructions to resolve *"Payment Failed"* or *"NPCI Inactive"* errors.
- **Document Compression**: Explains 200KB limits, DPI scanning parameters (100–150 DPI), and valid PDF/JPEG formats.
- **Portal Login & Passwords**: Guidance for MeriPehchaan (National SSO), DigiLocker, and password reset rules.
- **Status Tracking & Grievance Redressal**: Step-by-step navigation for PFMS tracking and filing formal grievances on CPGRAMS (`pgportal.gov.in`).
- **Transparency & Safety**: Strict policy against pretending to submit applications or access private biometric data without authorized government APIs.

### 4. Modern ChatGPT-Style Interface
- **Premium Light Theme**: Warm civic aesthetics with subtle saffron and emerald accents.
- **Collapsible Sidebar**: Search past conversations, rename conversations, delete sessions, export transcripts, and view active citizen profile.
- **Voice Input**: Web Speech Recognition for hands-free speech queries.
- **Text-to-Speech**: Built-in speech synthesis to listen to scheme guidance aloud.
- **Zero Interface Clutter**: No unnecessary status labels or separate category menus — everything is seamlessly conversational.

---

## 🛠️ Project Structure

```
schemesathi1/
├── server/                    # Node.js / Express Backend
│   ├── index.js               # Express API endpoints & production server
│   └── data/                  # Separate scheme database files
│       ├── schemes.json       # 31+ Central and State welfare schemes
│       ├── helplines.json     # National emergency and welfare helplines
│       └── troubleshooting.json # Portal error diagnosis guides
├── src/
│   ├── components/            # React UI Components
│   │   ├── Header.tsx         # Brand logo, tricolor bar, export & new chat
│   │   ├── Sidebar.tsx        # ChatGPT-style conversation manager
│   │   ├── ChatArea.tsx       # Message thread, scheme cards & checklists
│   │   ├── ChatInput.tsx      # Suggestion chips, textarea & speech input
│   │   ├── SchemeModal.tsx    # Slide-over full scheme detail inspector
│   │   └── HelplineDrawer.tsx # Emergency 24x7 government helplines
│   ├── data/
│   │   ├── constants.ts       # States, occupations, helplines metadata
│   │   └── schemes.ts         # Master scheme records
│   ├── services/
│   │   ├── nlpEngine.ts       # Conversational questionnaire & matcher
│   │   ├── storageService.ts  # Persistent multi-session localStorage
│   │   └── troubleshootingData.ts # Portal troubleshooting data
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx                # Master Application Component
│   ├── main.tsx               # Root Entry Point
│   └── index.css              # Tailwind CSS imports and typography
├── index.html                 # HTML template with Plus Jakarta Sans
├── package.json               # Dependencies and execution scripts
├── tailwind.config.js         # Color palette and theme extensions
├── tsconfig.json              # TypeScript compilation settings
├── vite.config.ts             # Vite configuration
├── .env.example               # Environment variables template
└── README.md                  # Complete documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- npm or yarn

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development

# Optional: Google Gemini API key for hybrid LLM generative queries
GEMINI_API_KEY=
```
*Note: If no API key is provided, SchemeSathi runs fully offline using its built-in rule and NLP reasoning engine.*

### 3. Running the Application

#### Development Mode (Frontend)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Running the Backend API Server
```bash
npm run server
```
The server will start at [http://localhost:5000](http://localhost:5000).

#### Full Production Build
```bash
npm run build
npm start
```
This builds the optimized frontend bundle into `dist/` and serves both the API and client from port `5000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and total scheme count |
| `GET` | `/api/schemes` | List schemes with optional filters (`?state=`, `?category=`, `?level=`, `?q=`) |
| `GET` | `/api/schemes/:id` | Fetch complete details for a specific scheme |
| `GET` | `/api/helplines` | List 24x7 national emergency and department helplines |
| `GET` | `/api/troubleshoot` | Common portal troubleshooting guidelines |
| `POST` | `/api/eligibility` | Evaluates citizen criteria and returns ranked matching schemes |
| `POST` | `/api/chat` | Conversational query endpoint |

---

## 🛡️ Transparency & Safety Guidelines
SchemeSathi is an informational AI companion designed to guide citizens. It strictly adheres to:
1. **No Live Portal Fraud**: SchemeSathi never claims to directly submit applications or modify government records.
2. **Official Government Domains**: All recommendations link exclusively to verified official domains (`.gov.in` and `.nic.in`).
3. **Data Privacy**: Biometric details or private OTPs are never stored or requested by SchemeSathi.

---

## 📄 License
MIT License. Created for the empowerment and welfare of Indian citizens.
