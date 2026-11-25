"""
Mobile Price Range Prediction API
FastAPI backend with CORS enabled for frontend integration.
"""
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional
from predict import predict_price

app = FastAPI(
    title="Mobile Price Predictor API",
    description="AI-powered mobile phone price range classification",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MobileSpecs(BaseModel):
    """Mobile phone specifications input model."""
    battery_power: int = Field(..., ge=500, le=2000, description="Battery capacity in mAh")
    blue: int = Field(..., ge=0, le=1, description="Has Bluetooth (0/1)")
    clock_speed: float = Field(..., ge=0.5, le=3.0, description="Processor speed in GHz")
    dual_sim: int = Field(..., ge=0, le=1, description="Supports dual SIM (0/1)")
    fc: int = Field(..., ge=0, le=20, description="Front camera MP")
    four_g: int = Field(..., ge=0, le=1, description="Has 4G (0/1)")
    int_memory: int = Field(..., ge=2, le=64, description="Internal memory in GB")
    m_dep: float = Field(..., ge=0.1, le=1.0, description="Mobile depth in cm")
    mobile_wt: int = Field(..., ge=80, le=250, description="Weight in grams")
    n_cores: int = Field(..., ge=1, le=8, description="Number of cores")
    pc: int = Field(..., ge=0, le=20, description="Primary camera MP")
    px_height: int = Field(..., ge=0, le=1960, description="Pixel resolution height")
    px_width: int = Field(..., ge=500, le=2000, description="Pixel resolution width")
    ram: int = Field(..., ge=256, le=4000, description="RAM in MB")
    sc_h: int = Field(..., ge=5, le=19, description="Screen height in cm")
    sc_w: int = Field(..., ge=0, le=18, description="Screen width in cm")
    talk_time: int = Field(..., ge=2, le=20, description="Talk time in hours")
    three_g: int = Field(..., ge=0, le=1, description="Has 3G (0/1)")
    touch_screen: int = Field(..., ge=0, le=1, description="Has touchscreen (0/1)")
    wifi: int = Field(..., ge=0, le=1, description="Has WiFi (0/1)")


class PredictionResponse(BaseModel):
    """Prediction response model."""
    predicted_range: int
    predicted_label: str
    confidence: float
    color: str
    probabilities: dict
    top_features: list


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": True}


@app.post("/predict", response_model=PredictionResponse)
async def predict(specs: MobileSpecs):
    try:
        result = predict_price(specs.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sample")
async def get_sample():
    """Return a sample input for testing."""
    return {
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
    }


FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)