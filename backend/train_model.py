"""
Training Script for Mobile Price Range Prediction Model
Run this to retrain the model with new data.
"""
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# Load data
data_path = Path(__file__).parent.parent / "data" / "mobile_data.csv"
df = pd.read_csv(data_path)

print(f"Dataset loaded: {df.shape}")
print(f"Price range distribution:\n{df['price_range'].value_counts().sort_index()}")

# Feature engineering
X = df.drop('price_range', axis=1)
y = df['price_range']

X['screen_size'] = X['sc_h'] * X['sc_w']
X['pixel_density'] = (X['px_height'] * X['px_width']) / (X['sc_h'] * X['sc_w'] + 1)
X['total_camera'] = X['fc'] + X['pc']
X['memory_score'] = X['ram'] + X['int_memory'] * 50

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

rf = RandomForestClassifier(random_state=42, class_weight='balanced')
grid = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1)
grid.fit(X_train_scaled, y_train)

best_model = grid.best_estimator_
y_pred = best_model.predict(X_test_scaled)

print(f"\n✅ Best Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"🔧 Best Params: {grid.best_params_}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

# Save
model_dir = Path(__file__).parent / "models"
model_dir.mkdir(exist_ok=True)

artifacts = {
    'model': best_model,
    'scaler': scaler,
    'feature_columns': X.columns.tolist(),
    'feature_importance': dict(zip(X.columns, best_model.feature_importances_))
}

with open(model_dir / "mobile_price_model.pkl", "wb") as f:
    pickle.dump(artifacts, f)

print(f"\n💾 Model saved to: {model_dir / 'mobile_price_model.pkl'}")
