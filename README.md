# Diabetes Diagnosis Website

Ứng dụng web full-stack hỗ trợ **đánh giá nguy cơ tiểu đường** bằng Machine Learning, kèm chatbot AI (Ollama) để đưa lời khuyên sức khỏe theo kết quả chẩn đoán.

## Tính năng chính

- Đăng ký / đăng nhập người dùng (JWT)
- Dự đoán nguy cơ tiểu đường từ chỉ số sức khỏe
- Lưu lịch sử chẩn đoán
- Xem bài viết kiến thức sức khỏe
- Chatbot AI tư vấn theo ngữ cảnh kết quả chẩn đoán
- Giao diện React + Tailwind responsive

## Kiến trúc dự án

- `backend/`: Flask API + ML + database
- `frontend/`: React (Vite)
- `database/`: SQL scripts (`schema.sql`, `seed.sql`)

## Công nghệ sử dụng

### Backend
- Flask, Flask-CORS
- Flask-SQLAlchemy, Flask-Migrate
- Flask-JWT-Extended
- scikit-learn, pandas, numpy, joblib
- requests (kết nối Ollama API)

### Frontend
- React 18
- Vite
- React Router
- Axios
- Tailwind CSS

## Yêu cầu môi trường

- Python 3.10+ (khuyến nghị 3.11)
- Node.js 18+
- npm
- (Tuỳ chọn) Ollama nếu dùng chatbot AI

## Cài đặt nhanh

### 1) Clone project

```bash
git clone <repo-url>
cd Diabetes_Diagnosis_Website
```

### 2) Cài backend

```bash
cd backend
python -m venv .venv
```

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

Cài dependencies:

```bash
pip install -r requirements.txt
```

Tạo file môi trường:

```bash
copy .env.example .env
```

> Trên macOS/Linux dùng: `cp .env.example .env`

### 3) Cài frontend

Mở terminal mới:

```bash
cd frontend
npm install
copy .env.example .env
```

## Chạy ứng dụng

### Chạy backend (Flask)

> Quan trọng: chạy trong thư mục `backend/` để tránh lỗi đường dẫn module.

```bash
cd backend
python run.py
```

Backend mặc định chạy tại:
- `http://localhost:5000`

### Chạy frontend (Vite)

```bash
cd frontend
npm run dev
```

Frontend thường chạy tại:
- `http://localhost:5173`
- hoặc `http://localhost:5174` (nếu cổng 5173 bận)

## Huấn luyện lại mô hình ML

Nếu muốn train lại model:

```bash
cd backend
python ml/train.py
```

Model sẽ được lưu trong thư mục `backend/ml/models/`.

## Chatbot AI với Ollama (tuỳ chọn)

Ứng dụng có API chatbot tại `backend/app/routes/chat.py`.

### Bước 1: Cài Ollama
- Tải tại: https://ollama.ai

### Bước 2: Chạy Ollama service

```bash
ollama serve
```

### Bước 3: Tải model (ví dụ)

```bash
ollama pull qwen2.5:0.5b
```

Khi Ollama chưa chạy, chatbot sẽ báo không khả dụng (đây là hành vi bình thường).

## API chính

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Predict
- `POST /api/predict/`

### Records
- `GET /api/records/`
- `GET /api/records/<id>`
- `DELETE /api/records/<id>`

### Articles
- `GET /api/articles/`
- `GET /api/articles/<id>`

### Chat
- `GET /api/chat/status`
- `GET /api/chat/models`
- `POST /api/chat/set-model` (JWT)
- `POST /api/chat/send` (JWT)
- `POST /api/chat/stream` (JWT)
- `POST /api/chat/health-advice` (JWT)
- `POST /api/chat/clear` (JWT)

## Chạy test backend

```bash
cd backend
pytest
```

## Biến môi trường

### `backend/.env`

Ví dụ:

```env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///diabetes_diagnosis.db
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Lỗi thường gặp

### 1) Backend không chạy khi đứng ở thư mục gốc
- Triệu chứng: `python run.py` báo lỗi import/module.
- Cách xử lý: `cd backend` rồi chạy `python run.py`.

### 2) CORS error ở frontend
- Đảm bảo backend đang chạy cổng `5000`.
- Frontend dùng đúng `VITE_API_BASE_URL`.
- Frontend có thể chạy ở `5173` hoặc `5174`.

### 3) Chatbot báo lỗi 503
- Ollama chưa chạy hoặc chưa pull model.
- Chạy `ollama serve` và `ollama pull mistral`.

## Lưu ý y tế

Ứng dụng chỉ mang tính **hỗ trợ tham khảo** và không thay thế tư vấn y khoa chuyên môn. Luôn tham khảo bác sĩ để chẩn đoán và điều trị chính xác.
