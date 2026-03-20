import joblib
import numpy as np
import os

class PredictService:
    """Service for making predictions using ML model"""
    
    def __init__(self):
        """Initialize the service and load model"""
        self.model = None
        self.scaler = None
        self.load_model()
    
    def load_model(self):
        """Load trained model and scaler"""
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'best_model.pkl')
        scaler_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'scaler.pkl')
        
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
        except Exception as e:
            print(f"Error loading model: {e}")
    
    def preprocess(self, data):
        """Preprocess input data"""
        features = [
            data.get('pregnancies', 0),
            data.get('glucose', 0),
            data.get('blood_pressure', 0),
            data.get('skin_thickness', 0),
            data.get('insulin', 0),
            data.get('bmi', 0),
            data.get('diabetes_pedigree_function', 0),
            data.get('age', 0)
        ]
        
        X = np.array(features).reshape(1, -1)
        
        if self.scaler:
            X = self.scaler.transform(X)
        
        return X
    
    def predict(self, data):
        """Make prediction"""
        if not self.model:
            raise Exception("Model not loaded. Please train the model first.")
        
        X = self.preprocess(data)
        prediction = self.model.predict(X)[0]
        probability = self.model.predict_proba(X)[0][1]
        
        return int(prediction), float(probability)
