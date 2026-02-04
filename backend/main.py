from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
import base64
import os
from dotenv import load_dotenv

load_dotenv('.env.local')
load_dotenv()

app = FastAPI()

# Allow CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "*"],
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

# Helper to decode base64 to raw bytes
def decode_base64(b64_string):
    if not b64_string:
        return None
    if "base64," in b64_string:
        b64_string = b64_string.split("base64,")[1]
    return base64.b64decode(b64_string)

# Style settings for different photography looks
STYLE_PROMPTS = {
    "studio": "professional studio lighting, clean white or neutral background, high-end fashion photography",
    "outdoor": "natural daylight, outdoor urban or nature setting, lifestyle photography",
    "lifestyle": "casual everyday setting, warm natural lighting, candid lifestyle photography",
    "editorial": "high fashion editorial style, dramatic lighting, magazine-quality photography"
}

@app.post("/api/generate")
async def generate_image(request: ImageURLRequest):
    print("Request received in generate_image endpoint (Gemini)")
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("ERROR: GEMINI_API_KEY is missing!")
            raise HTTPException(status_code=500, detail="Missing Gemini API Key.")

        print(f"Generating with Gemini 2.0 Flash Exp Image Generation...")
        print(f"Style: {request.style}, Category: {request.category}")

        client = genai.Client(api_key=api_key)

        model_image_bytes = decode_base64(request.image_base64)
        garment_image_bytes = decode_base64(request.garment_base64)

        if not model_image_bytes or not garment_image_bytes:
            raise HTTPException(status_code=400, detail="Missing image data (Base64 required).")

        # Get style-specific prompt additions
        style_desc = STYLE_PROMPTS.get(request.style, STYLE_PROMPTS["studio"])
        category_desc = request.category.replace("_", " ")

        # Build the comprehensive prompt for virtual try-on
        prompt = f"""Create a stunning, photorealistic virtual try-on image.

TASK: Generate an image of the person from the first photo wearing the clothing item from the second photo.

CRITICAL REQUIREMENTS:
1. IDENTITY: Preserve the person's exact face, facial features, skin tone, hair, and body proportions
2. GARMENT: Show the clothing item from the second image on the person naturally
3. FIT: The garment should fit the person's body shape realistically with proper draping and folds
4. POSE: Maintain the person's natural pose or adjust slightly for a flattering look

STYLE: {style_desc}

TECHNICAL SPECS:
- Category: {category_desc} clothing
- Quality: Ultra high resolution, 4K quality
- Lighting: Realistic shadows and highlights that match the garment's fabric
- Focus: Sharp focus on the person and garment

OUTPUT: A single beautiful, inspiring fashion photograph that would make someone want to purchase this item."""

        # Use gemini-2.0-flash-exp-image-generation which supports image output
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp-image-generation',
            contents=[
                prompt,
                types.Part.from_bytes(data=model_image_bytes, mime_type="image/jpeg"),
                types.Part.from_bytes(data=garment_image_bytes, mime_type="image/jpeg")
            ],
            config=types.GenerateContentConfig(
                response_modalities=['image', 'text']
            )
        )

        # Extract image from response
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    # Found image
                    b64_img = base64.b64encode(part.inline_data.data).decode('utf-8')
                    mime_type = part.inline_data.mime_type or "image/png"
                    output_url = f"data:{mime_type};base64,{b64_img}"
                    print("Generation complete (Inline Data)")
                    return {"status": "success", "generated_image_url": output_url, "original_image_url": request.image_url}

        # If no image found, check if there's text explaining why
        if response.text:
            print(f"Model returned text instead of image: {response.text}")
            return {"status": "error", "message": f"Model response: {response.text}"}

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
