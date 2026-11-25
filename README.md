# 📱 Mobile Price Range Predictor

> **AI-powered mobile phone price range classification system** with a modern web interface and production-ready FastAPI backend.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![Scikit-learn](https://img.shields.io/badge/Scikit--Learn-1.3+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

---

##  Features

-  Machine Learning Model** — Random Forest with GridSearchCV hyperparameter tuning
-  4 Price Categories** — Low, Medium, High, Very High Cost
-  Probability Distribution** — Visual confidence bars for each class
-  Feature Importance** — Top 5 decision factors displayed
-  Modern Web UI** — Glassmorphism design with animated charts
-  FastAPI Backend** — High-performance async API with CORS
-  Responsive Design** — Works on desktop, tablet, and mobile
-  Jupyter Notebook** — Complete EDA and model training pipeline
-  Sample Data Loader** — One-click test with realistic specs

---

##  Project Structure

```
mobile-price-predictor/
├── backend/
│   ├── app.py                    # FastAPI application
│   ├── predict.py                # Prediction logic & feature engineering
│   ├── train_model.py            # Model training script
│   ├── requirements.txt          # Python dependencies
│   └── models/
│       └── mobile_price_model.pkl    # Trained ML model
├── frontend/
│   ├── index.html                # Main UI
│   ├── style.css                 # Glassmorphism styling
│   └── script.js                 # Interactive logic
├── data/
│   └── mobile_data.csv           # Training dataset (2000 samples)
├── notebook/
│   └── mobile_price_eda.ipynb    # Jupyter notebook for EDA
└── README.md
```

---

##  Quick Start

### Prerequisites
- Python 3.10+
- pip

### 1. Clone & Navigate

```bash
cd mobile-price-predictor
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

**API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/predict` | POST | Make prediction |
| `/sample` | GET | Get sample input |
| `/docs` | GET | Swagger UI |
| `/redoc` | GET | ReDoc documentation |

### 3. Launch Frontend

Open `frontend/index.html` in your browser:

```bash
# Option 1: Direct open
cd frontend
open index.html        # Mac
start index.html       # Windows
xdg-open index.html    # Linux

# Option 2: Using Python HTTP server
cd frontend
python -m http.server 3000
# Then visit http://localhost:3000
```

> **Note:** For CORS to work properly, serve the frontend via a local server.

---

##  Model Details

### Algorithm
- **Primary:** Random Forest Classifier
- **Tuning:** GridSearchCV with 5-fold cross-validation
- **Scaling:** StandardScaler
- **Class Balancing:** Built-in class weights

### Features (20 inputs + 4 engineered)
| Category | Features |
|----------|----------|
| **Performance** | RAM, CPU Cores, Clock Speed |
| **Display** | Resolution (H×W), Screen Size (H×W) |
| **Camera** | Primary MP, Front MP |
| **Battery** | Battery Power, Talk Time |
| **Storage** | Internal Memory |
| **Physical** | Weight, Depth |
| **Connectivity** | Bluetooth, Dual SIM, 3G, 4G, WiFi, Touch Screen |
| **Engineered** | Screen Size, Pixel Density, Total Camera, Memory Score |

### Performance
```
Accuracy: ~83-85%
F1-Score (Macro): ~0.82
```

---

##  API Usage

### cURL Example

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "battery_power": 1500,
    "blue": 1,
    "clock_speed": 2.0,
    "dual_sim": 1,
    "fc": 8,
    "four_g": 1,
    "int_memory": 32,
    "m_dep": 0.5,
    "mobile_wt": 150,
    "n_cores": 4,
    "pc": 12,
    "px_height": 1080,
    "px_width": 1920,
    "ram": 2048,
    "sc_h": 14,
    "sc_w": 7,
    "talk_time": 12,
    "three_g": 1,
    "touch_screen": 1,
    "wifi": 1
  }'
```

### Python Example

```python
import requests

url = "http://localhost:8000/predict"
data = {
    "battery_power": 1500,
    "ram": 2048,
    "pc": 12,
    # ... all other features
}

response = requests.post(url, json=data)
result = response.json()

print(f"Predicted: {result['predicted_label']}")
print(f"Confidence: {result['confidence']}%")
```

### Response Format

```json
{
  "predicted_range": 2,
  "predicted_label": "High Cost ",
  "confidence": 87.5,
  "color": "#f59e0b",
  "probabilities": {
    "low_cost": 5.2,
    "medium_cost": 12.3,
    "high_cost": 87.5,
    "very_high_cost": 0.0
  },
  "top_features": [
    {"feature": "ram", "value": 2048, "importance": 0.2845},
    {"feature": "battery_power", "value": 1500, "importance": 0.1823}
  ]
}
```

---

##  Frontend Features

-  **Dark Theme** with animated gradient orbs
-  **Glassmorphism** cards with backdrop blur
-  **Animated probability bars** with smooth transitions
-  **Circular confidence meter** with SVG animation
-  **Interactive sliders** with real-time value display
-  **Toggle switches** for binary features
-  **Fully responsive** grid layout
-  **Loading animation** with triple-ring spinner

---

##  Retraining the Model

```bash
cd backend
python train_model.py
```

This will:
1. Load data from `../data/mobile_data.csv`
2. Perform feature engineering
3. Run GridSearchCV hyperparameter tuning
4. Evaluate on test set
5. Save updated model to `models/mobile_price_model.pkl`

---

##  Jupyter Notebook

Explore the complete data analysis:

```bash
cd notebook
jupyter notebook mobile_price_eda.ipynb
```

Contents:
- Data loading & validation
- Statistical summary
- Target distribution visualization
- Correlation heatmap
- Feature distributions by price range
- Feature engineering
- Model training & hyperparameter tuning
- Confusion matrix
- Feature importance analysis

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **ML** | Scikit-learn, NumPy, Pandas |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Styling** | Glassmorphism, CSS Grid, Flexbox |
| **Icons** | Font Awesome 6 |
| **Fonts** | Inter (Google Fonts) |

---

##  Dataset

The dataset contains 2,000 mobile phone records with 20 features:

| Feature | Range | Description |
|---------|-------|-------------|
| `battery_power` | 500-2000 | Battery capacity (mAh) |
| `ram` | 256-4000 | RAM (MB) |
| `pc` | 0-20 | Primary camera (MP) |
| `fc` | 0-20 | Front camera (MP) |
| `int_memory` | 2-64 | Internal storage (GB) |
| `n_cores` | 1-8 | CPU cores |
| `clock_speed` | 0.5-3.0 | Processor speed (GHz) |
| `px_height` | 0-1960 | Screen resolution height |
| `px_width` | 500-2000 | Screen resolution width |
| `sc_h` | 5-19 | Screen height (cm) |
| `sc_w` | 0-18 | Screen width (cm) |
| `mobile_wt` | 80-250 | Weight (grams) |
| `talk_time` | 2-20 | Max talk time (hours) |
| `m_dep` | 0.1-1.0 | Mobile depth (cm) |
| Binary features | 0/1 | Bluetooth, Dual SIM, 3G, 4G, WiFi, Touch Screen |

**Target:** `price_range` (0=Low, 1=Medium, 2=High, 3=Very High)

---

## 🧑 Author

** Shani  **
** Meenakshi Triphati

---

##  License

This project is licensed under the MIT License.

---

##  Acknowledgments

- Dataset inspired by Kaggle's Mobile Price Classification
- UI design inspired by modern glassmorphism trends
- Built with ❤️ for the ML community
