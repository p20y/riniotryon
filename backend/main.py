from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import time
import os

app = FastAPI()

class EmailRequest(BaseModel):
    email: str
    image_url: str
    user_name: str = "User"

@app.get("/health")
def read_root():
    return {"status": "ok"}

class ImageURLRequest(BaseModel):
    image_url: str
    style: str = "default"

@app.post("/api/generate")
async def generate_image(request: ImageURLRequest):
    # Mock AI Generation
    # We now have the request.image_url which is the permanent Supabase URL
    
    # In production:
    # 1. Send request.image_url to Replicate/Flux
    # 2. Receive result
    
    time.sleep(2)  # Simulate processing time
    
    # Return a high-quality stylized placeholder from Unsplash
    mock_images = [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", # Fashion model
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop", # Fashion dark
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop", # Minimalist
    ]
    
    return {"status": "success", "generated_image_url": mock_images[0], "original_image_url": request.image_url}

@app.post("/api/send-email")
def send_email(request: EmailRequest):
    # Mock Email Sending
    print(f"Sending email to {request.email} for user {request.user_name}")
    print(f"Image attached: {request.image_url}")
    return {"status": "sent"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
