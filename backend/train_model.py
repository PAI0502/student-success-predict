"""
Train ML models for student performance prediction
Implements multiple models with hyperparameter tuning and evaluation
"""

import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    accuracy_score,
    precision_recall_fscore_support
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

def load_and_preprocess_data(filepath='sample_students.csv'):
    """Load data and create engineered features"""
    df = pd.read_csv(filepath)
    
    # Create derived features
    df['engagement_index'] = (
        df['cultural_activity_score'] * 0.25 +
        df['class_participation_score'] * 0.25 +
        df['sports_activity_score'] * 0.25 +
        df['curricular_activity_score'] * 0.25
    )
    
    # Create attendance bucket
    df['attendance_bucket'] = pd.cut(
        df['attendance_pct'],
        bins=[0, 60, 80, 100],
        labels=['Low', 'Medium', 'High']
    )
    
    # Create ratio feature (guard against division by zero)
    df['internal_to_attendance_ratio'] = df['internal_marks_avg'] / (df['attendance_pct'] + 1)
    
    # Encode target
    df['target'] = (df['final_result'] == 'Pass').astype(int)
    
    return df

def create_feature_set(df):
    """Select features for modeling"""
    feature_cols = [
        'attendance_pct',
        'internal_marks_avg',
        'cultural_activity_score',
        'class_participation_score',
        'sports_activity_score',
        'curricular_activity_score',
        'engagement_index',
        'internal_to_attendance_ratio'
    ]
    
    # Add optional features if available
    optional_features = ['study_hours_per_week', 'previous_gpa', 'social_support_index']
    for feat in optional_features:
        if feat in df.columns and df[feat].notna().sum() > len(df) * 0.5:
            feature_cols.append(feat)
    
    X = df[feature_cols]
    y = df['target']
    
    return X, y, feature_cols

def train_models(X_train, X_test, y_train, y_test):
    """Train multiple models and compare performance"""
    models = {}
    results = {}
    
    print("\n🤖 Training Models...")
    print("=" * 60)
    
    # 1. Logistic Regression (Baseline)
    print("\n1. Logistic Regression (Baseline)")
    lr_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))
    ])
    lr_pipeline.fit(X_train, y_train)
    models['logistic_regression'] = lr_pipeline
    results['logistic_regression'] = evaluate_model(lr_pipeline, X_test, y_test, "Logistic Regression")
    
    # 2. Random Forest
    print("\n2. Random Forest")
    rf_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            class_weight='balanced',
            random_state=42
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    models['random_forest'] = rf_pipeline
    results['random_forest'] = evaluate_model(rf_pipeline, X_test, y_test, "Random Forest")
    
    # 3. XGBoost
    print("\n3. XGBoost")
    xgb_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('classifier', XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss'
        ))
    ])
    
    # Calculate scale_pos_weight for imbalanced data
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb_pipeline.named_steps['classifier'].set_params(scale_pos_weight=scale_pos_weight)
    
    xgb_pipeline.fit(X_train, y_train)
    models['xgboost'] = xgb_pipeline
    results['xgboost'] = evaluate_model(xgb_pipeline, X_test, y_test, "XGBoost")
    
    # 4. SVM (if dataset is small enough)
    if len(X_train) < 1000:
        print("\n4. Support Vector Machine")
        svm_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('classifier', SVC(kernel='rbf', probability=True, class_weight='balanced', random_state=42))
        ])
        svm_pipeline.fit(X_train, y_train)
        models['svm'] = svm_pipeline
        results['svm'] = evaluate_model(svm_pipeline, X_test, y_test, "SVM")
    
    return models, results

def evaluate_model(model, X_test, y_test, model_name):
    """Evaluate a single model"""
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
    
    print(f"\n{model_name} Results:")
    print(f"  Accuracy: {accuracy:.4f}")
    print(f"  ROC AUC: {roc_auc:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    print(f"  F1 Score: {f1:.4f}")
    
    return {
        'accuracy': accuracy,
        'roc_auc': roc_auc,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'classification_report': classification_report(y_test, y_pred, output_dict=True)
    }

def get_feature_importance(model, feature_names):
    """Extract feature importance from trained model"""
    if hasattr(model.named_steps['classifier'], 'feature_importances_'):
        importances = model.named_steps['classifier'].feature_importances_
        return dict(zip(feature_names, importances.tolist()))
    elif hasattr(model.named_steps['classifier'], 'coef_'):
        importances = np.abs(model.named_steps['classifier'].coef_[0])
        return dict(zip(feature_names, importances.tolist()))
    return {}

def save_model_artifacts(models, results, feature_names):
    """Save trained models and metadata"""
    import os
    os.makedirs('models', exist_ok=True)
    
    # Find best model based on F1 score
    best_model_name = max(results, key=lambda x: results[x]['f1_score'])
    best_model = models[best_model_name]
    
    # Save best model
    with open('models/best_model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    
    # Save all models
    for name, model in models.items():
        with open(f'models/{name}.pkl', 'wb') as f:
            pickle.dump(model, f)
    
    # Save model card
    model_card = {
        'training_date': datetime.now().isoformat(),
        'best_model': best_model_name,
        'feature_names': feature_names,
        'model_results': results,
        'feature_importance': {
            name: get_feature_importance(model, feature_names)
            for name, model in models.items()
        }
    }
    
    with open('models/model_card.json', 'w') as f:
        json.dump(model_card, f, indent=2)
    
    print(f"\n✅ Models saved to models/ directory")
    print(f"🏆 Best model: {best_model_name} (F1: {results[best_model_name]['f1_score']:.4f})")
    
    return best_model_name

if __name__ == "__main__":
    print("=" * 60)
    print("Student Performance Prediction - Model Training")
    print("=" * 60)
    
    # Load data
    print("\n📊 Loading and preprocessing data...")
    df = load_and_preprocess_data()
    X, y, feature_names = create_feature_set(df)
    
    print(f"  Total samples: {len(df)}")
    print(f"  Features: {len(feature_names)}")
    print(f"  Pass rate: {(y == 1).sum() / len(y) * 100:.1f}%")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"  Training set: {len(X_train)} samples")
    print(f"  Test set: {len(X_test)} samples")
    
    # Train models
    models, results = train_models(X_train, X_test, y_train, y_test)
    
    # Save artifacts
    best_model = save_model_artifacts(models, results, feature_names)
    
    print("\n" + "=" * 60)
    print("Training complete! ✨")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Review model_card.json for detailed metrics")
    print("  2. Run app.py to start the API server")
    print("  3. Use the frontend to make predictions")
