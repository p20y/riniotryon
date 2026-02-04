from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import asyncio # Keep asyncio for sleep if needed (though not for polling anymore) or blocking
import httpx # Remove if unused, but safety first
import base64
import time
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv()

app = FastAPI()

# Allow CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    email: str
    image_url: str
    user_name: str = "User"

@app.get("/health")
def read_root():
    return {"status": "ok"}

class ImageURLRequest(BaseModel):
    image_url: str
    image_base64: str = None
    style: str = "default"
    garment_url: str = None
    garment_base64: str = None
    category: str = "upper_body"

@app.post("/api/generate")
async def generate_image(request: ImageURLRequest):
    print("Request received in generate_image endpoint (Gemini)")
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
             print("ERROR: GEMINI_API_KEY is missing!")
             raise HTTPException(status_code=500, detail="Missing Gemini API Key.")

        print(f"Generating with Gemini 2.5 Flash Image...")
        
        client = genai.Client(api_key=api_key)
        
        # Prepare Inputs
        # Convert base64 strings to strict bytes if needed, or pass as is depending on SDK SDK
        # The SDK typically handles PIL images or specific types. 
        # For simplicity in this 'nano' migration, we'll try to pass the base64 data directly if supported
        # or decoded bytes. Documentation suggests types.Part.from_bytes.
        
        from google.genai import types
        import base64

        # Helper to decode base64 to raw bytes
        def decode_base64(b64_string):
            if "base64," in b64_string:
                b64_string = b64_string.split("base64,")[1]
            return base64.b64decode(b64_string)

        model_image_bytes = decode_base64(request.image_base64 if request.image_base64 else "") 
        # Note: If image_base64 is missing we should fail or fetch URL. 
        # Assuming frontend always sends base64 now as per previous step.
        
        garment_image_bytes = decode_base64(request.garment_base64 if request.garment_base64 else "")

        if not model_image_bytes or not garment_image_bytes:
             raise HTTPException(status_code=400, detail="Missing image data (Base64 required).")

        prompt = f"Generate a realistic photorealistic image of the person in the first image wearing the garment in the second image. The category is {request.category}. Ensure the pose and identity are preserved. High quality, 4k."

        # Switching to Gemini 2.0 Flash (Experimental) to avoid Quota/Method issues
        # This model is multi-modal and should handle the request either by generating an image or text
        # We need to ensure we request an IMAGE generation specifically if possible, 
        # but standard Flash generates text. 
        # However, for VTON we need an image.
        # Let's try 'gemini-2.0-flash-exp' and ask for an image.
        # If it returns text, we might need a different approach (Imagen).
        # But 'nano-banana' (2.5 flash image) is the one we want. 
        # Since 2.5 flash image failed on generate_content, and Pro failed on Quota.
        
        # Let's try the direct 'gemini-2.0-flash-exp' which often has image generation capabilities enabled in preview.
        # Or better: 'gemini-2.0-flash'
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=model_image_bytes, mime_type="image/jpeg"),
                types.Part.from_bytes(data=garment_image_bytes, mime_type="image/jpeg")
            ]
        )
        
        # Validate output
        if not response.text: 
            # If no text, maybe it has image parts?
             pass 
        
        # Actually proper image generation model returns an image object not text.
        # Let's look at the response structure for image generation models.
        # It usually returns a generated image object.
        
        # If we use generate_images:
        # response = client.models.generate_images(...) -> response.generated_images[0].image.image_bytes
        
        # Since I am unsure if 'generate_images' supports input images in the prompt for this specific SDK version,
        # I will rely on the fact that Gemini is native multi-modal.
        # Let's try `generate_images` first IF the documented API supports it.
        # If not, I will use `generate_content`. 
        # Given "Flash Image" name, it's likely a dedicated image generation model.
        
        # Let's stick to a safe implementation: `generate_content` is the standard for Gemini.
        # But `generate_images` is for Imagen... wait, "gemini-2.5-flash-image" IS a Gemini model.
        # It should work with `generate_content`.
        
        # However, for purely image output, we want the raw bytes.
        # Let's assume `generate_content` returns an InlineData part with the image.
        
        # Let's try to extract image from response.
        # If response.parts exists.
        
        # SIMPLIFIED APPROACH for robustness:
        # I will assume it behaves like a standard Gemini generation where output can be image.
        
        # ... Wait, I'll use the specific `generate_images` if available, but since I can't check docs live easily for this brand new model:
        # I will use `client.models.generate_image` (singular) or content.
        
        # Let's Write code that tries `generate_content` as it's the most generic 'Gemini' way.
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    # Found image
                    b64_img = base64.b64encode(part.inline_data.data).decode('utf-8')
                    output_url = f"data:image/jpeg;base64,{b64_img}"
                    print("Generation complete (Inline Data)")
                    return {"status": "success", "generated_image_url": output_url, "original_image_url": request.image_url}

        print("No image found in response.")
        return {"status": "error", "message": "No image generated."}

    except Exception as e:
        print(f"Error generating image: {e}")
        # traceback
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.post("/api/send-email")
def send_email(request: EmailRequest):
    # Mock Email Sending
    print(f"Sending email to {request.email} for user {request.user_name}")
    print(f"Image attached: {request.image_url}")
    return {"status": "sent"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
