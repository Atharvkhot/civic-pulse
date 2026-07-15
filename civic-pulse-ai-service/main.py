from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import io
import time

app = FastAPI(title="Civic Pulse AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "AI Service is running"}

@app.post("/verify-image")
async def verify_image(before: UploadFile = File(...), after: UploadFile = File(None)):
    """
    Mock AI Verification.
    In real production, we'd pass this image through a YOLO model 
    like Ultralytics to detect 'potholes', 'garbage', etc.
    We would also run OpenCV SIFT to detect if the 'after' image is just a duplicate or stock image.
    For this implementation, we will simulate the processing and return a confidence score.
    """
    start_time = time.time()
    
    # Read the image bytes (to simulate processing)
    before_bytes = await before.read()
    
    # Simulate processing time
    time.sleep(1.5)
    
    # Mock result logic
    # In a real scenario:
    # 1. Run YOLO to count instances of issues
    # 2. Extract EXIF data to check timestamp/geo-location spoofing
    # 3. Compare 'after' image with 'before' image to verify similarity context but issue resolution.
    
    confidence_score = 0.85 + (len(before_bytes) % 15) / 100.0  # Just a random realistic score
    
    is_fake = False
    if after:
        after_bytes = await after.read()
        if len(before_bytes) == len(after_bytes):
             is_fake = True
             confidence_score = 0.10

    return {
        "verified": confidence_score > 0.7 and not is_fake,
        "confidence_score": round(confidence_score, 2),
        "is_duplicate_or_fake": is_fake,
        "processing_time_ms": int((time.time() - start_time) * 1000)
    }

@app.post("/detect-pothole")
async def detect_pothole(image: UploadFile = File(...)):
    """
    Simulates high-speed live camera pothole detection.
    Reads an uploaded stream snapshot, applies pseudo-AI evaluation, and returns a dict with coordinates.
    """
    image_bytes = await image.read()
    
    # Fast simulation (no heavy time.sleep to keep the live feed responsive)
    # The logic here is purely random/mock for prototype purposes.
    # In reality, this would pass the image_bytes to a YOLOv8 engine.
    
    # We will trigger a "detection" randomly ~30% of the time, or based on byte content logic
    is_detected = (len(image_bytes) % 10) > 6
    confidence = 0.0
    box = []
    
    if is_detected:
        confidence = 0.75 + (len(image_bytes) % 25) / 100.0
        # return a mock bounding box [x1, y1, width, height] percentage of frame
        box = [0.2, 0.4, 0.5, 0.3]
        
    return {
        "detected": is_detected,
        "confidence": round(confidence, 2),
        "bounding_box": box
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
