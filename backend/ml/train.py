import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

def train_model():
    """Train and save the diabetes prediction model"""
    
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'diabetes.csv')
    df = pd.read_csv(data_path)
    
    # Prepare features and target
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall: {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score: {f1_score(y_test, y_pred):.4f}")
    
    # Save model and scaler
    models_path = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_path, exist_ok=True)
    
    joblib.dump(model, os.path.join(models_path, 'best_model.pkl'))
    joblib.dump(scaler, os.path.join(models_path, 'scaler.pkl'))
    
    print(f"\nModel saved to {models_path}")

if __name__ == '__main__':
    train_model()
