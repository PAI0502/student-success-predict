"""
Generate synthetic student performance dataset
Creates realistic sample data with correlations between features
"""

import pandas as pd
import numpy as np
from datetime import datetime

np.random.seed(42)

def generate_student_data(n_students=200):
    """Generate synthetic student dataset with realistic correlations"""
    
    data = []
    
    for i in range(n_students):
        student_id = f"1DA23IS{str(i+1).zfill(3)}"
        semester = np.random.choice([3, 4, 5, 6, 7, 8])
        
        # Generate attendance with some natural variation
        attendance_pct = np.clip(np.random.normal(75, 15), 0, 100)
        
        # Internal marks correlate with attendance but with noise
        base_marks = attendance_pct * 0.6 + np.random.normal(20, 10)
        internal_marks_avg = np.clip(base_marks, 0, 100)
        
        # Activity scores (0-10) with some correlation to engagement
        engagement_factor = np.random.normal(6, 2)
        cultural_activity_score = np.clip(engagement_factor + np.random.normal(0, 1.5), 0, 10)
        class_participation_score = np.clip(engagement_factor + np.random.normal(0, 1.5), 0, 10)
        sports_activity_score = np.clip(np.random.normal(5, 2), 0, 10)
        curricular_activity_score = np.clip(engagement_factor + np.random.normal(0, 1.5), 0, 10)
        
        # Optional features
        study_hours_per_week = np.clip(np.random.normal(15, 5), 0, 50)
        previous_gpa = np.clip(internal_marks_avg / 25 + np.random.normal(0, 0.3), 0, 4)
        social_support_index = np.clip(np.random.normal(7, 2), 0, 10)
        
        # Calculate engagement index
        engagement_index = (
            cultural_activity_score * 0.25 +
            class_participation_score * 0.25 +
            sports_activity_score * 0.25 +
            curricular_activity_score * 0.25
        )
        
        # Determine final result based on weighted factors
        performance_score = (
            attendance_pct * 0.35 +
            internal_marks_avg * 0.45 +
            engagement_index * 1.5 +
            np.random.normal(0, 5)  # Random noise
        )
        
        # Convert to Pass/Fail
        if performance_score >= 55:
            final_result = "Pass"
            # For passing students, add numeric grade
            final_grade = np.clip(internal_marks_avg + np.random.normal(5, 10), 50, 100)
        else:
            final_result = "Fail"
            final_grade = np.clip(internal_marks_avg - np.random.normal(5, 5), 0, 49)
        
        # Categorize grade
        if final_grade >= 85:
            target_category = "Excellent"
        elif final_grade >= 70:
            target_category = "Good"
        elif final_grade >= 50:
            target_category = "Average"
        else:
            target_category = "Poor"
        
        data.append({
            'student_id': student_id,
            'semester': semester,
            'attendance_pct': round(attendance_pct, 1),
            'internal_marks_avg': round(internal_marks_avg, 1),
            'cultural_activity_score': round(cultural_activity_score, 1),
            'class_participation_score': round(class_participation_score, 1),
            'sports_activity_score': round(sports_activity_score, 1),
            'curricular_activity_score': round(curricular_activity_score, 1),
            'study_hours_per_week': round(study_hours_per_week, 1),
            'previous_gpa': round(previous_gpa, 2),
            'social_support_index': round(social_support_index, 1),
            'engagement_index': round(engagement_index, 2),
            'final_result': final_result,
            'final_grade': round(final_grade, 1),
            'target_category': target_category
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating synthetic student dataset...")
    df = generate_student_data(250)
    
    # Save to CSV
    output_file = "sample_students.csv"
    df.to_csv(output_file, index=False)
    
    print(f"\n✅ Generated {len(df)} student records")
    print(f"📁 Saved to: {output_file}")
    print("\nDataset Statistics:")
    print(f"  - Pass Rate: {(df['final_result'] == 'Pass').sum() / len(df) * 100:.1f}%")
    print(f"  - Fail Rate: {(df['final_result'] == 'Fail').sum() / len(df) * 100:.1f}%")
    print(f"\nGrade Distribution:")
    print(df['target_category'].value_counts())
    print(f"\nSample rows:")
    print(df.head(3))
    print(f"\nDataset info:")
    print(df.info())
