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
