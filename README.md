# Diabetes Diagnosis Application

A full-stack web application for diabetes risk assessment using machine learning.

## Project Structure

### Backend (Flask API)
- **app/**: Flask application
  - `config.py`: Configuration settings
  - `models/`: Database models (User, DiagnosisRecord)
  - `routes/`: API endpoints (auth, predict, records, articles)
  - `services/`: Business logic
  - `utils/`: Validators and decorators
- **ml/**: Machine learning
  - `notebooks/`: Jupyter notebooks for EDA and training
  - `data/`: PIMA diabetes dataset
  - `models/`: Trained model files
  - `train.py`: Model training script
- `requirements.txt`: Python dependencies
- `run.py`: Application entry point

### Frontend (React)
- **src/**:
  - `components/`: Reusable React components
  - `pages/`: Application pages
  - `context/`: State management (AuthContext)
  - `hooks/`: Custom hooks (useAuth)
  - `api/`: API client with axios
  - `utils/`: Utility functions
- `package.json`: Node dependencies
- `.env`: Environment variables

### Database
- `schema.sql`: Database schema
- `seed.sql`: Sample data

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create .env file (copy from .env.example):
```bash
copy .env.example .env
```

4. Run migrations:
```bash
flask db upgrade
```

5. Train the model:
```bash
python ml/train.py
```

6. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

- **User Authentication**: Register and login
- **Diabetes Prediction**: ML-based risk assessment
- **Medical History**: Track diagnosis records over time
- **Health Articles**: Educational content
- **Responsive Design**: Works on desktop and mobile

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/logout`: Logout user
- `GET /api/auth/profile`: Get user profile

### Prediction
- `POST /api/predict/`: Make prediction

### Records
- `GET /api/records/`: Get user's diagnosis records
- `GET /api/records/<id>`: Get specific record
- `DELETE /api/records/<id>`: Delete record

### Articles
- `GET /api/articles/`: Get all articles
- `GET /api/articles/<id>`: Get specific article

## Tech Stack

### Backend
- Flask
- SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- scikit-learn (ML)
- Joblib (Model persistence)

### Frontend
- React 18
- React Router
- Axios
- Tailwind CSS

### Database
- SQLite (Development)
- PostgreSQL (Production)

## Testing

Run tests:
```bash
cd backend
pytest
```

## Deployment

### Backend (Production)
1. Set environment variables in production
2. Use production database (PostgreSQL recommended)
3. Deploy using Gunicorn or similar WSGI server

### Frontend (Production)
1. Build the application:
```bash
npm run build
```
2. Deploy the dist folder to a static hosting service

## License

MIT License

## Disclaimer

This application provides an educational assessment based on machine learning. 
It should NOT be used as a substitute for professional medical advice, diagnosis, 
or treatment. Always consult with qualified healthcare professionals.
