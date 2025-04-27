import torch
from torchvision.models import vgg16
from torchvision.models import VGG16_Weights
import os 
import torch.nn as nn

class CustomVGG16(torch.nn.Module):
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
    
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'Fing-VGG16_model.pth')
if not os.path.isfile(model_path):
    raise FileNotFoundError(f"Modèle introuvable à l'emplacement : {model_path}")

def load_model(model_path=model_path, n_classes=600):
    model = CustomVGG16(n_classes)
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    return model
