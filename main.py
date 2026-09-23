from fastapi import FastAPI, HTTPException
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
import joblib
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Crop Yield Prediction API",
    description="API for predicting crop yield using a trained XGBoost model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

preprocessor = joblib.load("crop_yield_preprocessor.pkl")

model = XGBRegressor()

model.load_model("xgboost_model.json")


############ Rquest Body ########################

class CropYieldInput(BaseModel):
    State_Name          :str
    District_Name       :str
    Crop_Year           :int
    Season              :str
    Crop                :str
    Area                :float = Field(gt=0)



@app.get("/")
def Home():
    return{
        "message": "Crop Yield Prediction API is running",
        "docs": "/docs"
    }

@app.post("/predict")
def predict(data: CropYieldInput):

    try:

        input_df = pd.DataFrame({
            "State_Name"      :[data.State_Name],      
            "District_Name"   :[data.District_Name],
            "Crop_Year"       :[data.Crop_Year],
            "Season"          :[data.Season],
            "Crop"            :[data.Crop],
            "Area"            :[data.Area]
        })

        processed_df = preprocessor.transform(input_df)

        yield_prdiction_log  = model.predict(processed_df)[0]

        Yield_prediction = np.expm1(yield_prdiction_log)

        return {
            "predicted_yield": float(Yield_prediction)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


