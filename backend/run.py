import os
from app import create_app, db

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    return {'db': db}

if __name__ == '__main__':
    print("=" * 60)
    print("[START] Starting Diabetes Diagnosis Backend")
    print("=" * 60)
    print(f"[SERVER] Server: http://localhost:5000")
    print(f"[CORS] CORS enabled for: http://localhost:5173")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
