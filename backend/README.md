# Student Performance Predictor - Backend

ML-powered prediction system for student academic outcomes based on attendance, engagement, and performance metrics.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Generate Sample Data

```bash
python generate_data.py
```

Creates `sample_students.csv` with 250 synthetic student records featuring:
- Realistic correlations between features
- Balanced Pass/Fail distribution
- Multiple engagement metrics

### 3. Train Models

```bash
python train_model.py
```

Trains and evaluates multiple ML models:
- ✅ Logistic Regression (baseline)
- ✅ Random Forest
- ✅ XGBoost
- ✅ SVM (for smaller datasets)

Outputs:
- `models/best_model.pkl` - Best performing model
- `models/model_card.json` - Metrics, feature importance, metadata
- Individual model files for each algorithm

### 4. Start API Server

```bash
python app.py
```

Flask API runs on `http://localhost:5000`

### 5. Run Frontend

In the project root:
```bash
npm run dev
```

Access UI at `http://localhost:8080`

## 📊 Dataset Schema

Required columns for CSV uploads:

| Column | Type | Range | Description |
|--------|------|-------|-------------|
| `student_id` | string | - | Unique student identifier |
| `semester` | int | 1-8 | Current semester |
| `attendance_pct` | float | 0-100 | Attendance percentage |
| `internal_marks_avg` | float | 0-100 | Average internal assessment marks |
| `cultural_activity_score` | float | 0-10 | Cultural event participation |
| `class_participation_score` | float | 0-10 | In-class engagement |
| `sports_activity_score` | float | 0-10 | Sports/fitness activities |
| `curricular_activity_score` | float | 0-10 | Labs, workshops, projects |

**Optional columns:**
- `study_hours_per_week` (float)
- `previous_gpa` (float, 0-4)
- `social_support_index` (float, 0-10)

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns server and model status.

### Single Prediction
```
POST /api/predict
Content-Type: application/json

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
```

**Response:**
```json
{
  "student_id": "1DA23IS001",
  "prediction": "Pass",
  "probability": 0.87,
  "confidence": 0.87,
  "risk_level": "low",
  "top_factors": [
    {"feature": "Internal Marks", "impact": 68.4},
    {"feature": "Attendance Pct", "impact": 52.3},
    {"feature": "Engagement Index", "impact": 35.6}
  ],
  "timestamp": "2025-01-10T12:34:56",
  "model_version": "random_forest"
}
```

### Bulk Predictions
```
POST /api/predict/bulk
Content-Type: multipart/form-data

file: students.csv
```

Or JSON array:
```
POST /api/predict/bulk
Content-Type: application/json

[
  { "student_id": "001", "semester": 5, ... },
  { "student_id": "002", "semester": 6, ... }
]
```

### Analytics
```
GET /api/analytics
```
Returns model performance metrics and feature importance.

## 🧪 Model Performance

Typical metrics on test set:

| Model | Accuracy | F1 Score | ROC AUC |
|-------|----------|----------|---------|
| Random Forest | 87.4% | 0.86 | 0.92 |
| XGBoost | 86.8% | 0.85 | 0.91 |
| Logistic Regression | 83.2% | 0.82 | 0.88 |

## 📁 Project Structure

```
backend/
├── app.py                  # Flask API server
├── train_model.py          # Model training pipeline
├── generate_data.py        # Synthetic data generator
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── models/                # Saved models (created by train_model.py)
│   ├── best_model.pkl
│   ├── model_card.json
│   └── ...
└── sample_students.csv    # Generated sample data
```

## 🔧 Advanced Usage

### Custom Training

Modify hyperparameters in `train_model.py`:

```python
rf_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('classifier', RandomForestClassifier(
        n_estimators=200,      # ← Increase trees
        max_depth=15,          # ← Deeper trees
        min_samples_split=10,
        class_weight='balanced',
        random_state=42
    ))
])
```

### SHAP Explainability

To add full SHAP explanations:

```python
import shap

# After training
explainer = shap.TreeExplainer(model.named_steps['classifier'])
shap_values = explainer.shap_values(X_test)

# Save for API use
pickle.dump(explainer, open('models/shap_explainer.pkl', 'wb'))
```

### Database Integration

Update `app.py` to use PostgreSQL/MySQL:

```python
from sqlalchemy import create_engine

engine = create_engine('postgresql://user:password@localhost/students')

@app.route('/api/predict', methods=['POST'])
def predict_single():
    # ... prediction code ...
    
    # Save to database
    result_df = pd.DataFrame([response])
    result_df.to_sql('predictions', engine, if_exists='append', index=False)
```

## 🧩 Feature Engineering

Current derived features:

1. **Engagement Index**
   ```python
   0.25 * cultural + 0.25 * class_participation + 
   0.25 * sports + 0.25 * curricular
   ```

2. **Internal-to-Attendance Ratio**
   ```python
   internal_marks / (attendance + 1)
   ```

3. **Attendance Bucket**
   - Low: 0-60%
   - Medium: 60-80%
   - High: 80-100%

Add more in `train_model.py`:

```python
# Polynomial features
df['attendance_squared'] = df['attendance_pct'] ** 2

# Interaction terms
df['marks_engagement_interaction'] = (
    df['internal_marks_avg'] * df['engagement_index']
)
```

## 📝 Testing

```bash
# Unit tests
pytest tests/

# API tests
pytest tests/test_api.py -v

# Coverage
pytest --cov=. --cov-report=html
```

## 🚢 Deployment

### Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t student-predictor .
docker run -p 5000:5000 student-predictor
```

### Heroku

```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create student-performance-api
git push heroku main
```

## 📚 Additional Resources

- **Jupyter Notebooks**: See `notebooks/` for EDA and model exploration
- **Documentation**: Full API docs at `/api/docs` (add Swagger)
- **Monitoring**: Integrate Prometheus/Grafana for production

## 🤝 Contributing

1. Add new features to `generate_data.py`
2. Update training pipeline in `train_model.py`
3. Add endpoints to `app.py`
4. Test thoroughly
5. Update this README

## 📄 License

MIT License - feel free to use for educational purposes.

---

**Need help?** Check the main project README or create an issue.
