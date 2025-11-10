"""
Flask API for Student Performance Prediction
Provides REST endpoints for single and bulk predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load trained model and metadata
try:
    with open('models/best_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('models/model_card.json', 'r') as f:
        model_card = json.load(f)
    print("✅ Model loaded successfully")
    print(f"   Model: {model_card['best_model']}")
    print(f"   Training date: {model_card['training_date']}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("   Please run train_model.py first")
    model = None
    model_card = None

def preprocess_input(data):
    """Preprocess input data to match training format"""
    # Create DataFrame
    df = pd.DataFrame([data])
    
    # Calculate engagement index if not provided
    if 'engagement_index' not in df.columns:
        df['engagement_index'] = (
            df.get('cultural_activity_score', 0) * 0.25 +
            df.get('class_participation_score', 0) * 0.25 +
            df.get('sports_activity_score', 0) * 0.25 +
            df.get('curricular_activity_score', 0) * 0.25
        )
    
    # Calculate ratio feature
    if 'internal_to_attendance_ratio' not in df.columns:
        df['internal_to_attendance_ratio'] = (
            df.get('internal_marks_avg', 0) / (df.get('attendance_pct', 1) + 1)
        )
    
    # Select features in correct order
    feature_names = model_card['feature_names']
    X = df[feature_names]
    
    return X

def calculate_shap_values(X):
    """
    Simplified feature importance (in production, use actual SHAP)
    Returns top 3 contributing factors
    """
    feature_names = model_card['feature_names']
    best_model_name = model_card['best_model']
    
    # Get feature importances from model card
    importance_dict = model_card['feature_importance'].get(best_model_name, {})
    
    # Get actual values and multiply by importance
    contributions = []
    for feature in feature_names:
        if feature in importance_dict and feature in X.columns:
            value = X[feature].iloc[0]
            importance = importance_dict[feature]
            contributions.append({
                'feature': feature.replace('_', ' ').title(),
                'impact': float(value * importance * 10)  # Scaled for display
            })
    
    # Sort by absolute impact and return top 3
    contributions.sort(key=lambda x: abs(x['impact']), reverse=True)
    return contributions[:3]

def determine_risk_level(probability):
    """Determine risk level based on probability"""
    if probability > 0.7:
        return "low"
    elif probability > 0.4:
        return "medium"
    else:
        return "high"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_info': {
            'name': model_card['best_model'] if model_card else None,
            'training_date': model_card['training_date'] if model_card else None
        } if model_card else None
    })

@app.route('/api/predict', methods=['POST'])
def predict_single():
    """
    Predict outcome for a single student
    
    Expected JSON format:
    {
        "student_id": "1DA23IS001",
        "semester": 5,
        "attendance_pct": 87.5,
        "internal_marks_avg": 72,
        "cultural_activity_score": 7,
        "class_participation_score": 8,
        "sports_activity_score": 5,
        "curricular_activity_score": 9
    }
    """
    if not model:
        return jsonify({'error': 'Model not loaded. Please train model first.'}), 500
    
    try:
        data = request.json
        
        # Preprocess
        X = preprocess_input(data)
        
        # Predict
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0][1]  # Probability of Pass
        
        # Get explanation (simplified SHAP)
        top_factors = calculate_shap_values(X)
        
        # Determine risk level
        risk_level = determine_risk_level(probability)
        
        # Create response
        response = {
            'student_id': data.get('student_id', 'unknown'),
            'prediction': 'Pass' if prediction == 1 else 'Fail',
            'probability': float(probability),
            'confidence': float(probability if prediction == 1 else 1 - probability),
            'risk_level': risk_level,
            'top_factors': top_factors,
            'timestamp': datetime.now().isoformat(),
            'model_version': model_card['best_model']
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict/bulk', methods=['POST'])
def predict_bulk():
    """
    Predict outcomes for multiple students
    
    Expected: CSV file upload or JSON array
    """
    if not model:
        return jsonify({'error': 'Model not loaded. Please train model first.'}), 500
    
    try:
        # Check if file upload or JSON
        if 'file' in request.files:
            file = request.files['file']
            df = pd.read_csv(file)
        else:
            data = request.json
            df = pd.DataFrame(data)
        
        results = []
        for _, row in df.iterrows():
            try:
                X = preprocess_input(row.to_dict())
                prediction = model.predict(X)[0]
                probability = model.predict_proba(X)[0][1]
                
                results.append({
                    'student_id': row.get('student_id', 'unknown'),
                    'prediction': 'Pass' if prediction == 1 else 'Fail',
                    'probability': float(probability),
                    'risk_level': determine_risk_level(probability)
                })
            except Exception as e:
                results.append({
                    'student_id': row.get('student_id', 'unknown'),
                    'error': str(e)
                })
        
        return jsonify({
            'total': len(results),
            'predictions': results,
            'summary': {
                'pass': sum(1 for r in results if r.get('prediction') == 'Pass'),
                'fail': sum(1 for r in results if r.get('prediction') == 'Fail'),
                'high_risk': sum(1 for r in results if r.get('risk_level') == 'high')
            }
        })
    
    except Exception as e:
        print(f"Error in bulk prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get cohort analytics and metrics"""
    if not model_card:
        return jsonify({'error': 'Model card not found'}), 500
    
    # Return model performance metrics and feature importance
    return jsonify({
        'model_performance': model_card['model_results'],
        'feature_importance': model_card['feature_importance'][model_card['best_model']],
        'best_model': model_card['best_model'],
        'training_date': model_card['training_date']
    })

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get model metadata"""
    if not model_card:
        return jsonify({'error': 'Model card not found'}), 500
    
    return jsonify(model_card)

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("Student Performance Prediction API")
    print("=" * 60)
    
    if model:
        print("\n✅ API Server Ready")
        print(f"   Model: {model_card['best_model']}")
        print(f"   Features: {len(model_card['feature_names'])}")
        print("\n📍 Endpoints:")
        print("   GET  /api/health         - Health check")
        print("   POST /api/predict        - Single prediction")
        print("   POST /api/predict/bulk   - Bulk predictions")
        print("   GET  /api/analytics      - Model analytics")
        print("   GET  /api/model/info     - Model metadata")
    else:
        print("\n⚠️  Model not loaded!")
        print("   Run: python train_model.py")
    
    print("\n🚀 Starting server on http://localhost:5000")
    print("=" * 60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
