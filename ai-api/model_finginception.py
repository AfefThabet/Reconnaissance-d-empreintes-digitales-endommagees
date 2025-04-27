import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import Inception_V3_Weights
def load_model(model_path="Fing-InceptionV3_model.pth", n_classes=600):
    # Charger le modèle préentraîné
    weights = Inception_V3_Weights.IMAGENET1K_V1
    model = models.inception_v3(weights=weights, aux_logits=True)
    # Geler toutes les couches
    for param in model.parameters():
        param.requires_grad = False

    # Débloquer les couches à partir d’un certain niveau
    fine_tune_at = 249
    for param in list(model.parameters())[fine_tune_at:]:
        param.requires_grad = True

    # Modifier les couches finales
    model.fc = nn.Linear(model.fc.in_features, n_classes)
    if model.aux_logits:
        model.AuxLogits.fc = nn.Linear(model.AuxLogits.fc.in_features, n_classes)

    # Charger les poids sauvegardés si fournis
    if model_path:
        model.load_state_dict(torch.load(model_path, map_location='cpu'))

    model.eval()
    return model
