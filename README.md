<div align="center">

# 🤖 Multi-AGent-AI

### A microservices-powered, multi-agent AI platform with RAG, PDF intelligence, and built-in billing.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://multi-agent-ai-azure.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent%20Orchestration-1C3C3C?style=for-the-badge)](https://www.langchain.com/langgraph)
[![License](https://img.shields.io/badge/license-Unspecified-lightgrey?style=for-the-badge)](#-license)

[Live Demo](https://multi-agent-ai-azure.vercel.app) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Gateway](#-api-gateway-routes) · [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Multi-AGent-AI** is a full-stack, production-style AI assistant platform built on a **microservices architecture**. Instead of one monolithic backend, the system is split into independently deployable services — a **gateway**, **auth**, **chat**, **agent**, and **billing** — all fronted by a modern React application with a built-in **Monaco code editor**, chat UI, and Markdown/syntax-highlighted rendering.

At its core, the `agent` service uses **LangGraph** to orchestrate multi-agent reasoning workflows, pulling in multiple LLM providers (Google Gemini, Groq, OpenRouter), web search via **Tavily**, vector retrieval via **Qdrant**, and structured data via **Supabase** — enabling **Retrieval-Augmented Generation (RAG)**, **PDF ingestion & generation**, and **tool-using agents** in a single conversational surface.

> ⚡ This project is under active development. Some pieces described below are inferred directly from the source (service manifests, entry points, and the gateway's routing logic) — dive into each service's `package.json` for the ground truth on dependencies.

---

## ✨ Features

- 🧠 **Multi-Agent Orchestration** — Agent workflows built with LangChain + LangGraph, capable of reasoning, tool use, and delegation.
- 🔌 **Pluggable LLM Providers** — Google Gemini, Groq, and OpenRouter wired up out of the box.
- 🔍 **Retrieval-Augmented Generation (RAG)** — Qdrant vector store + Supabase for grounded, context-aware answers.
- 🌐 **Live Web Search** — Tavily integration lets agents pull real-time information into their responses.
- 📄 **PDF Intelligence** — Upload and parse PDFs (`pdf-parse`) or generate new ones on the fly (`pdfkit`).
- 💬 **Persistent Chat History** — Dedicated chat microservice backed by MongoDB.
- 🔐 **Secure Auth Gateway** — Cookie-based authentication enforced centrally at the API gateway.
- 💳 **Built-in Billing** — Subscription/payment handling via Razorpay.
- ⚡ **Redis-Backed Caching** — Shared caching layer via `ioredis` for performance-sensitive paths.
- 🖥️ **Rich Frontend Experience** — React 19 + Redux Toolkit + Tailwind CSS 4, with an embedded Monaco code editor, Markdown rendering (`react-markdown` + `remark-gfm`), syntax-highlighted code blocks, and smooth Framer Motion animations.
- 🔥 **Firebase Integration** — Client-side Firebase SDK wired into the frontend.

---

## 🏗️ Architecture

The system follows an **API Gateway + Microservices** pattern. The gateway is the single public entry point; it authenticates every request and proxies it to the appropriate downstream service.

```
                              ┌─────────────────────────┐
                              │        Frontend          │
                              │  React 19 · Vite · Redux │
                              │  Tailwind CSS · Monaco    │
                              └────────────┬─────────────┘
                                           │  REST (Axios)
                                           ▼
                              ┌─────────────────────────┐
                              │        API Gateway       │
                              │  Express 5 · cookie auth │
                              │  request proxying        │
                              └───┬────┬────┬────┬───────┘
                    /api/auth     │    │    │    │  /api/me
                 ┌────────────────┘    │    │    └───────────────┐
                 ▼                     ▼    ▼                    ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │  Auth Service │   │ Chat Service │   │ Agent Service│   │Billing Service│
        │              │   │  MongoDB     │   │  LangGraph   │   │  Razorpay    │
        │              │   │  (history)   │   │  Multi-LLM   │   │  MongoDB     │
        └──────────────┘   └──────────────┘   │  RAG / Tools │   └──────────────┘
                                               │  PDF I/O     │
                                               └───────┬──────┘
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ▼                   ▼                   ▼
                             ┌────────────┐     ┌──────────────┐    ┌─────────────┐
                             │  Qdrant    │     │   Supabase   │    │   Tavily    │
                             │ (vectors)  │     │ (structured) │    │ (web search)│
                             └────────────┘     └──────────────┘    └─────────────┘

                         Shared cache layer: Redis (ioredis) across services
```

**Request flow:** every call from the frontend hits the **gateway**, which validates the session cookie/JWT via its `protect` middleware, attaches identifying headers, and forwards the request to the correct microservice — `auth`, `chat`, `agent`, or `billing`.

---

## 🧰 Tech Stack

<table>
<tr><td valign="top" width="50%">

### Frontend
| Category | Technology |
|---|---|
| Framework | React 19 + Vite |
| State | Redux Toolkit / React-Redux |
| Styling | Tailwind CSS 4 |
| Code Editor | Monaco Editor |
| Markdown | react-markdown + remark-gfm |
| Syntax Highlighting | react-syntax-highlighter |
| Animation | Motion (Framer Motion) |
| HTTP Client | Axios |
| Auth / Backend-as-a-Service | Firebase |
| Icons | Lucide React, React Icons |
| Linting | ESLint 10 |

</td><td valign="top" width="50%">

### Backend
| Service | Responsibility | Key Dependencies |
|---|---|---|
| **Gateway** | Auth enforcement, routing, reverse proxy | Express 5, express-http-proxy, cookie-parser, cors, morgan |
| **Auth** | User authentication & sessions | Express, MongoDB (Mongoose) |
| **Chat** | Conversation persistence | Express, Mongoose |
| **Agent** | Multi-agent reasoning, RAG, PDFs | LangChain, LangGraph, Gemini, Groq, OpenRouter, Tavily, Qdrant, Supabase, Mongoose, Multer, pdf-parse, pdfkit, Zod |
| **Billing** | Payments & subscriptions | Express, Mongoose, Razorpay |
| **Shared/Cache** | Cross-service caching | Redis (ioredis), dotenv |

</td></tr>
</table>

---

## 📁 Repository Structure

```
Multi-AGent-AI/
├── backend/
│   ├── gateway/                 # API Gateway — auth, routing, proxying
│   │   ├── controllers/
│   │   ├── middleware/          # auth.middleware.js (protect)
│   │   ├── utils/               # proxyWithHeaders.js
│   │   └── index.js
│   ├── services/
│   │   ├── auth/                # Authentication service
│   │   ├── chat/                # Chat history service
│   │   │   ├── config/ controllers/ models/ routes/
│   │   │   └── index.js
│   │   ├── agent/                # Core multi-agent + RAG + PDF service
│   │   │   ├── agents/          # Agent definitions
│   │   │   ├── graph/           # LangGraph orchestration graphs
│   │   │   ├── pdf/             # PDF parsing & generation routes
│   │   │   ├── routes/ controllers/ utils/ config/
│   │   │   └── index.js
│   │   └── billing/              # Subscriptions & payments (Razorpay)
│   │       ├── config/ controllers/ models/ routes/
│   │       └── index.js
│   ├── shared/                   # Shared utilities across services
│   └── package.json               # Root backend deps (dotenv, ioredis)
├── frontend/
│   ├── src/                       # React application source
│   ├── public/
│   ├── utils/
│   ├── vite.config.js
│   └── package.json
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** instance (for `auth`, `chat`, `billing` services)
- **Redis** instance (for shared caching)
- **Qdrant** instance (vector database for RAG)
- **Supabase** project
- API keys: **Google Gemini**, **Groq**, **OpenRouter**, **Tavily**, **Razorpay**, **Firebase**

### 1. Clone the repository

```bash
git clone https://github.com/Jyotishman2/Multi-AGent-AI.git
cd Multi-AGent-AI
```

### 2. Set up the backend services

Each microservice runs independently and needs its own `.env` file and install step:

```bash
# Gateway
cd backend/gateway
npm install
```

Create `backend/gateway/.env`:
```env
PORT=8000
FRONTEND_URL=http://localhost:5173
AUTH_SERVICE=http://localhost:8001
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
```

```bash
npm run dev
```

Repeat the install/run steps for each service:

```bash
cd backend/services/auth      && npm install && npm run dev
cd backend/services/chat      && npm install && npm run dev
cd backend/services/agent     && npm install && npm run dev
cd backend/services/billing   && npm install && npm run dev
```

Each service expects its own `.env` (Mongo connection strings, provider API keys, `PORT`, etc.) matching the imports found in that service's `config/` folder.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173** (Vite default) and talk to the gateway via Axios.

### 4. Open the app

Visit `http://localhost:5173` in your browser — or check out the **[live deployment](https://multi-agent-ai-azure.vercel.app)**.

---

## 🌐 API Gateway Routes

All client traffic flows through the gateway (`backend/gateway`), which enforces authentication on protected routes before proxying downstream:

| Route | Protected | Proxies To |
|---|:---:|---|
| `POST/GET /api/auth/*` | ❌ | Auth Service |
| `* /api/chat/*` | ✅ | Chat Service |
| `* /api/agent/*` | ✅ | Agent Service |
| `* /api/billing/*` | ✅ | Billing Service |
| `GET /api/me` | ✅ | Current authenticated user |
| `GET /` | ❌ | Gateway health check |

Protected routes require a valid session (checked via the gateway's `protect` middleware) and forward identifying headers to downstream services via `proxyWithHeader`.

---

## 🗺️ Roadmap Ideas

- [ ] Add automated tests across all services
- [ ] Containerize each service with Docker + docker-compose for one-command local spin-up
- [ ] Add a `LICENSE` file
- [ ] API documentation (OpenAPI/Swagger) for each service
- [ ] CI/CD pipeline for linting, testing, and deployment

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please keep service boundaries clean — changes to one microservice shouldn't require touching unrelated ones.

---

## 📜 License

This repository does not currently declare a license file. Until one is added, please reach out to the maintainer before reusing this code in your own projects.

---

## 👤 Author

**Jyotishman2**
🔗 [GitHub Profile](https://github.com/Jyotishman2) · 🌐 [Live Project](https://multi-agent-ai-azure.vercel.app)

<div align="center">

⭐ **If you find this project interesting, consider giving it a star!** ⭐

</div>
