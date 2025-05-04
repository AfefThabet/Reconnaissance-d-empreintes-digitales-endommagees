import torch
import torch.nn as nn
from torchvision.models import efficientnet_b4, EfficientNet_B4_Weights
import os

class CustomEfficientNetB4(nn.Module):
    def __init__(self, n_classes=600):
        super().__init__()
        
        # Charger le modèle EfficientNet-B4 avec les poids préentraînés
        weights = EfficientNet_B4_Weights.DEFAULT
        base_model = efficientnet_b4(weights=weights)
        
        self.features = base_model.features
        for param in self.features.parameters():
            param.requires_grad = False

        for param in self.features[8:].parameters():
            param.requires_grad = True
        
        self.avgpool = base_model.avgpool  # AdaptiveAvgPool2d((1, 1))

        self.classifier = nn.Sequential(
            nn.Linear(base_model.classifier[1].in_features, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(),
            nn.Dropout(p=0.4),
            nn.Linear(1024, n_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

# Chemin du modèle
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'eff_model.pth2')

if not os.path.isfile(model_path):
    raise FileNotFoundError(f"Modèle introuvable à l'emplacement : {model_path}")

def load_model(model_path=model_path, n_classes=600):
    model = CustomEfficientNetB4(n_classes=n_classes)
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    return model
