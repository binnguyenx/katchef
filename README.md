# KatChef

Ứng dụng nấu ăn thông minh: quét nguyên liệu (camera), chat với trợ lý AI, gợi ý công thức và “tủ lạnh ảo” khi bật Firebase.

## Công nghệ

| Phần | Stack |
|------|--------|
| **Mobile / web** | Expo 54, React Native, TypeScript, Zustand |
| **API** | FastAPI (Python) |
| **AI** | Google Gemini (chat + vision) |
| **Dữ liệu người dùng** | Firebase (Auth / Firestore — tùy cấu hình) |

## Cấu trúc repo

```
katchef/
├── frontend/     # Ứng dụng Expo (iOS, Android, web)
├── backend/      # REST API (vision, chatbot, recipes)
├── ai/           # Prompt / logic hỗ trợ AI
└── requirements.txt
```

## Chạy backend (API)

Từ thư mục gốc repo:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # điền key thật, không commit .env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

- Health check: `http://localhost:8000/health`
- API có prefix `/api` (vision, chat, recipes)

Biến môi trường chính xem trong `.env.example` (`GEMINI_API_KEY`, `GEMINI_MODEL`, `MOCK_MODE`, Firebase Admin nếu dùng).

## Chạy frontend (Expo)

```bash
cd frontend
npm install
```

Tạo file `.env` (hoặc export) với **URL backend** và tùy chọn Firebase client:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_USE_MOCK_API=false
# EXPO_PUBLIC_FIREBASE_* … nếu dùng Firebase
npm run start
```

- Nếu **không** set `EXPO_PUBLIC_API_BASE_URL`, app sẽ dùng **mock API** (phù hợp demo không cần server).

## Scripts nhanh

| Lệnh | Mô tả |
|------|--------|
| `npm run start` (trong `frontend/`) | Expo dev server |
| `npm run ios` / `android` / `start:web` | Mở nền tảng tương ứng |
| `npm run typecheck` | Kiểm tra TypeScript |

## License

Private / theo quyết định của chủ repo.
