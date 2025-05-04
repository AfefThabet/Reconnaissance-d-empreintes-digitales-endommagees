from fastapi import FastAPI, UploadFile, File
import torch
from torchvision import transforms
from torchvision.models import vgg16, VGG16_Weights
from torchvision.models import EfficientNet_B4_Weights
from PIL import Image
import io
import os
import torch.nn as nn
import math

from model_fingvgg import load_model as load_vgg
from model_finginception import load_model as load_inception
from model_fingEfficientNetB4 import load_model as load_efficientnet 

app = FastAPI()

# === Chargement des modèles ===
vgg_model = load_vgg('Fing-VGG16_model.pth')
inception_model = load_inception("Fing-InceptionV3_model.pth")
efficientnet_model = load_efficientnet("eff_model.pth2")

# === Prétraitements ===
weights_vgg = VGG16_Weights.DEFAULT
preprocess_VGG = weights_vgg.transforms()

weights_efficientnet = torch.hub.load('pytorch/vision:v0.15.2', 'efficientnet_b4', pretrained=True).eval()  # pour récupérer les transforms
preprocess_EfficientNet = EfficientNet_B4_Weights.DEFAULT.transforms() 

def adjust_confidence(logits, temperature=4.0):
    """Adoucit les probabilités pour l'affichage"""
    scaled_logits = logits / temperature
    return torch.softmax(scaled_logits, dim=0)

# === Endpoint VGG16 ===
@app.post("/predict/Fing-VGG16")
async def predict_vgg(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        input_tensor = preprocess_VGG(image).unsqueeze(0)
        with torch.no_grad():
            output = vgg_model(input_tensor)
        probabilities = adjust_confidence(output[0])
        max_prob, pred_class = torch.max(probabilities, dim=0)
        return {"predicted_class": pred_class.item(),
                "Probability": math.floor(max_prob.item()*100)}
    except Exception as e:
        return {"error": str(e)}

# === Endpoint InceptionV3 ===
@app.post("/predict/Fing-InceptionV3")
async def predict_inception(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        transform = transforms.Compose([
            transforms.Resize(299),
            transforms.CenterCrop(299),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225])
        ])
        input_tensor = transform(image).unsqueeze(0)
        with torch.no_grad():
            output = inception_model(input_tensor)
        probabilities = adjust_confidence(output[0])
        max_prob, pred_class = torch.max(probabilities, dim=0)
        return {"predicted_class": pred_class.item(),
                "Probability": math.floor(max_prob.item()*100)}
    except Exception as e:
        return {"error": str(e)}

# === Endpoint EfficientNet-B4 ===
@app.post("/predict/Fing-EfficientNetB4")
async def predict_efficientnet(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        input_tensor = preprocess_EfficientNet(image).unsqueeze(0)
        with torch.no_grad():
            output = efficientnet_model(input_tensor)
        probabilities = adjust_confidence(output[0])
        max_prob, pred_class = torch.max(probabilities, dim=0)
        return {"predicted_class": pred_class.item(),
                "Probability": math.floor(max_prob.item()*100)}
    except Exception as e:
        return {"error": str(e)}

# Pour tester avec curl :
# curl.exe -X POST -F "file=@saved_images/image_0.png" http://127.0.0.1:5000/predict/Fing-EfficientNetB4
