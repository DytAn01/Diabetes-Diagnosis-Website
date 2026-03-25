import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os
import json
from datetime import datetime

def preprocess_data(df):
    """Preprocess data: handle zero values and scaling"""
    
    # Create copy to modify
    df_processed = df.copy()
    
    # Columns that shouldn't have zero values
    zero_cols = ['Glucose', 'BloodPressure', 'BMI', 'SkinThickness', 'Insulin']
    
    # Replace zeros with median values (excluding actual zeros)
    for col in zero_cols:
        # Get median excluding zeros
        median_val = df_processed[df_processed[col] > 0][col].median()
        df_processed.loc[df_processed[col] == 0, col] = median_val
    
    return df_processed

def train_model():
    """Train and save the diabetes prediction model with better approach"""
    
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'diabetes.csv')
    df = pd.read_csv(data_path)
    
    print("=" * 60)
    print("TRAINING DIABETES DIAGNOSIS MODEL")
    print("=" * 60)
    print(f"Dataset shape: {df.shape}")
    
    # Preprocess: Handle zero values
    print("\n📊 Preprocessing data...")
    df_processed = preprocess_data(df)
    
    # Prepare features and target
    X = df_processed.drop('Outcome', axis=1)
    y = df_processed['Outcome']
    
    # Split data with stratified sampling
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")
    print(f"Class distribution - Positive: {(y_train == 1).sum()}, Negative: {(y_train == 0).sum()}")
    
    # Scale features (for Logistic Regression component)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("\n🤖 Training models...")
    
    # RandomForest - uses original data (doesn't benefit from scaling)
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)
    
    # Gradient Boosting - better for this type of problem
    gb_model = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.1,
        max_depth=7,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        subsample=0.8
    )
    gb_model.fit(X_train, y_train)
    
    # Logistic Regression - uses scaled data
    lr_model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight='balanced',
        solver='lbfgs'
    )
    lr_model.fit(X_train_scaled, y_train)
    
    # Ensemble: Voting Classifier
    ensemble = VotingClassifier(
        estimators=[
            ('rf', rf_model),
            ('gb', gb_model),
            ('lr', lr_model)
        ],
        voting='soft'  # Use probability averaging
    )
    ensemble.fit(X_train, y_train)
    
    # Evaluate on test set
    print("\n📈 Evaluating models...")
    
    def evaluate_model(name, model, X_test_data, y_test):
        is_scaled = (name == 'Logistic Regression')
        X_eval = X_test_scaled if is_scaled else X_test_data
        
        y_pred = model.predict(X_eval)
        y_prob = model.predict_proba(X_eval)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        
        print(f"\n{name}:")
        print(f"  Accuracy:  {acc:.4f} | Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f} | F1-Score:  {f1:.4f} | AUC-ROC: {auc:.4f}")
        
        return {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'auc': auc}
    
    evaluate_model("RandomForest", rf_model, X_test, y_test)
    evaluate_model("GradientBoosting", gb_model, X_test, y_test)
    evaluate_model("LogisticRegression", lr_model, X_test_scaled, y_test)
    
    ensemble_results = evaluate_model("Ensemble (BEST)", ensemble, X_test, y_test)
    
    # Save models and artifacts
    models_path = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_path, exist_ok=True)
    
    print("\n💾 Saving artifacts...")
    joblib.dump(ensemble, os.path.join(models_path, 'best_model.pkl'))
    joblib.dump(scaler, os.path.join(models_path, 'scaler.pkl'))
    
    # Save feature names for future use
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, os.path.join(models_path, 'feature_names.pkl'))
    
    # Save metadata
    metadata = {
        'model_type': 'VotingClassifier (RandomForest + GradientBoosting + LogisticRegression)',
        'training_date': datetime.now().isoformat(),
        'dataset_shape': df.shape,
        'features': feature_names,
        'performance': ensemble_results,
        'preprocessing': 'Zero values replaced with median'
    }
    
    with open(os.path.join(models_path, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n Model saved to {models_path}")
    print(f" Features: {feature_names}")
    print(f" Training complete!")

if __name__ == '__main__':
    train_model()
