from fastapi import FastAPI, UploadFile, File
import torch
from torchvision import transforms
from torchvision.models import vgg16
from PIL import Image
import io
from torchvision.models import VGG16_Weights
import os 
import torch.nn as nn
import math
from model_fingvgg import load_model as load_vgg
from model_finginception import load_model as load_inception

app = FastAPI()

"""class CustomVGG16(torch.nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        
        # Charger VGG16 directement (sans encapsulation)
        self.features = vgg16(weights=VGG16_Weights.DEFAULT).features
        
        # Gel des couches comme avant
        for param in self.features[:24].parameters():
            param.requires_grad = False
            
        # Modifier avgpool et classifier
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Sequential(
            nn.Linear(512, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Linear(512, n_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

# Configuration
N_CLASSES = 600
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'Fing-VGG16_model.pth')

# Vérification du fichier modèle
if not os.path.isfile(model_path):
    raise FileNotFoundError(f"Modèle introuvable à l'emplacement : {model_path}")

# Chargement du modèle
model = CustomVGG16(N_CLASSES)
model.load_state_dict(torch.load(model_path, map_location='cpu'))
model.eval()"""

vgg_model = load_vgg('Fing-VGG16_model.pth')
# Prétraitement des images
weights = VGG16_Weights.DEFAULT
preprocess_VGG = weights.transforms()

def adjust_confidence(logits, temperature=4.0):
    """Adoucit les probabilités pour l'affichage"""
    scaled_logits = logits / temperature
    return torch.softmax(scaled_logits, dim=0)


@app.post("/predict/Fing-VGG16")
async def predict(file: UploadFile = File(...)):
    try:
        # Lecture et conversion de l'image
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        
        # Application du prétraitement
        input_tensor = preprocess_VGG(image).unsqueeze(0)
        
        # Prédiction
        with torch.no_grad():
            output = vgg_model(input_tensor)
        
        # Calcul des probabilités
        #probabilities = torch.nn.functional.softmax(output[0], dim=0)
        #max_value, predicted_class = torch.max(probabilities, dim=0)
        probabilities = adjust_confidence(output[0])
        max_prob, pred_class = torch.max(probabilities, dim=0)
        return {"predicted_class": pred_class.item(),
                "Probability": math.floor(max_prob.item()*100)}
    
    except Exception as e:
        return {"error": str(e)}
    
inception_model = load_inception("Fing-InceptionV3_model.pth")  # ou None si non chargé

@app.post("/predict/Fing-InceptionV3")
async def predict_inception(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        
        # Attention : Inception attend une taille 299x299
        transform = transforms.Compose([
            transforms.Resize(299),         # Redimensionner à la taille requise
            transforms.CenterCrop(299),     # Recadrer au centre
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
        ])
        
        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = inception_model(input_tensor)

        probabilities = adjust_confidence(output[0])
        max_prob, pred_class = torch.max(probabilities, dim=0)

        return {
            "predicted_class": pred_class.item(),
            "Probability": math.floor(max_prob.item()*100)
        }

    except Exception as e:
        return {"error": str(e)}
    

#uvicorn app:app --reload --port 5000
#curl.exe -X POST -F "file=@saved_images/image_0.png" http://127.0.0.1:5000/predict