# KatChef

Smart cooking companion: scan ingredients with the camera, chat with an AI assistant, get recipe suggestions, and use a virtual fridge when Firebase is enabled.

## Stack

| Layer | Tech |
|------|------|
| **Mobile / web** | Expo 54, React Native, TypeScript, Zustand |
| **API** | FastAPI (Python) |
| **AI** | Google Gemini (chat + vision) |
| **User data** | Firebase (Auth / Firestore — optional) |

## Repository layout

```
katchef/
├── frontend/     # Expo app (iOS, Android, web)
├── backend/      # REST API (vision, chatbot, recipes)
├── ai/           # AI prompts / helpers
└── requirements.txt
```

## Backend (API)

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # add real secrets; never commit .env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `http://localhost:8000/health`
- Routes are under `/api` (vision, chat, recipes)

See `.env.example` for variables (`GEMINI_API_KEY`, `GEMINI_MODEL`, `MOCK_MODE`, optional Firebase Admin).

## Frontend (Expo)

```bash
cd frontend
npm install
```

Use a `.env` file (or exports) with your **backend URL** and optional Firebase client keys:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_USE_MOCK_API=false
# EXPO_PUBLIC_FIREBASE_* … if using Firebase
npm run start
```

- If `EXPO_PUBLIC_API_BASE_URL` is unset, the app uses the **mock API** (handy for demos without a server).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` (in `frontend/`) | Expo dev server |
| `npm run ios` / `android` / `start:web` | Target platform |
| `npm run typecheck` | TypeScript check |

## License

Private / per repository owner.
