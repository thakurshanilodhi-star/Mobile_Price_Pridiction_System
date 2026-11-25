"""
Mobile Price Prediction Module
Handles feature engineering, scaling, and prediction logic.
"""
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

# Load model artifacts
MODEL_PATH = Path(__file__).parent / "models" / "mobile_price_model.pkl"

with open(MODEL_PATH, "rb") as f:
    artifacts = pickle.load(f)

model = artifacts["model"]
scaler = artifacts["scaler"]
feature_columns = artifacts["feature_columns"]

PRICE_LABELS = {
    0: "Low Cost 💰",
    1: "Medium Cost 💰💰",
    2: "High Cost 💰💰💰",
    3: "Very High Cost 💰💰💰💰"
}

PRICE_COLORS = {
    0: "#22c55e",   # green
    1: "#3b82f6",   # blue
    2: "#f59e0b",   # amber
    3: "#ef4444"    # red
}


def engineer_features(data: dict) -> pd.DataFrame:
    """Apply same feature engineering as training."""
    df = pd.DataFrame([data])
    df["screen_size"] = df["sc_h"] * df["sc_w"]
    df["pixel_density"] = (df["px_height"] * df["px_width"]) / (df["sc_h"] * df["sc_w"] + 1)
    df["total_camera"] = df["fc"] + df["pc"]
    df["memory_score"] = df["ram"] + df["int_memory"] * 50
    return df[feature_columns]


def predict_price(data: dict) -> dict:
    """
    Predict mobile price range from raw specs.

    Returns:
        dict with prediction, confidence, label, color, and probabilities
    """
    df = engineer_features(data)
    scaled = scaler.transform(df)

    prediction = int(model.predict(scaled)[0])
    probabilities = model.predict_proba(scaled)[0]
    confidence = float(np.max(probabilities))

    return {
        "predicted_range": prediction,
        "predicted_label": PRICE_LABELS[prediction],
        "confidence": round(confidence * 100, 2),
        "color": PRICE_COLORS[prediction],
        "probabilities": {
            "low_cost": round(probabilities[0] * 100, 2),
            "medium_cost": round(probabilities[1] * 100, 2),
            "high_cost": round(probabilities[2] * 100, 2),
            "very_high_cost": round(probabilities[3] * 100, 2)
        },
        "top_features": get_top_features(data)
    }


def get_top_features(data: dict) -> list:
    """Return top 5 most important features for this prediction."""
    importance = artifacts["feature_importance"]
    df = engineer_features(data)

    feature_values = []
    for feat in feature_columns:
        val = df[feat].values[0]
        feat_importance = importance.get(feat, 0)
        feature_values.append({
            "feature": feat,
            "value": round(float(val), 2),
            "importance": round(float(feat_importance), 4)
        })

    feature_values.sort(key=lambda x: x["importance"], reverse=True)
    return feature_values[:5]
