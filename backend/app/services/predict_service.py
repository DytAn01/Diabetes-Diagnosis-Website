import joblib
import numpy as np
import os

class PredictService:
    """Service for making predictions using ML ensemble model"""
    
    def __init__(self):
        """Initialize the service and load model"""
        self.model = None
        self.feature_names = None
        self.load_model()
    
    def load_model(self):
        """Load trained model and feature names"""
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'best_model.pkl')
        feature_names_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'models', 'feature_names.pkl')
        
        try:
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                print(f"✅ Model loaded: {type(self.model).__name__}")
            else:
                print(f"⚠️ Model file not found at {model_path}")
                
            if os.path.exists(feature_names_path):
                self.feature_names = joblib.load(feature_names_path)
                print(f"✅ Features loaded: {self.feature_names}")
            else:
                print(f"⚠️ Feature names not found. Using default order.")
                self.feature_names = [
                    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
                ]
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def preprocess(self, data):
        """Preprocess input data - handles zero values like training did"""
        # Map input keys to feature names (case-insensitive)
        feature_mapping = {
            'pregnancies': 'Pregnancies',
            'glucose': 'Glucose',
            'blood_pressure': 'BloodPressure',
            'skin_thickness': 'SkinThickness',
            'insulin': 'Insulin',
            'bmi': 'BMI',
            'diabetes_pedigree_function': 'DiabetesPedigreeFunction',
            'age': 'Age'
        }
        
        # Extract features in the correct order
        features = []
        for key in feature_mapping.keys():
            value = data.get(key, 0)
            
            # Convert to float and handle None
            try:
                value = float(value) if value is not None else 0
            except (ValueError, TypeError):
                value = 0
            
            features.append(value)
        
        # Handle zero values same as training: replace with reasonable defaults
        # These are based on typical/normal values for the dataset
        zero_replacements = {
            'Glucose': 120,           # Normal fasting glucose
            'BloodPressure': 80,      # Normal diastolic BP
            'SkinThickness': 20,      # Typical skin thickness
            'Insulin': 30,            # Normal fasting insulin
            'BMI': 25.0               # Normal BMI
        }
        
        for i, feature_name in enumerate(['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                                          'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']):
            if features[i] == 0 and feature_name in zero_replacements:
                features[i] = zero_replacements[feature_name]
        
        X = np.array(features).reshape(1, -1)
        
        return X
    
    def predict(self, data):
        """Make prediction"""
        if not self.model:
            raise Exception("❌ Model not loaded. Please train the model first by running: python ml/train.py")
        
        try:
            X = self.preprocess(data)
            
            # Ensemble model predicts
            prediction = self.model.predict(X)[0]  # 0 or 1
            probabilities = self.model.predict_proba(X)[0]  # [prob_of_0, prob_of_1]
            probability = float(probabilities[1])  # Probability of diabetes (class 1)
            
            # Debug output
            print(f"🔍 Prediction debug:")
            print(f"   Input features: {data}")
            print(f"   Processed: {X[0]}")
            print(f"   Raw probabilities: {probabilities}")
            print(f"   Prediction: {prediction} (diabetes=1, no_diabetes=0)")
            print(f"   Probability: {probability:.4f}")
            
            return int(prediction), probability
            
        except Exception as e:
            print(f"❌ Error during prediction: {e}")
            raise Exception(f"Prediction error: {str(e)}")
