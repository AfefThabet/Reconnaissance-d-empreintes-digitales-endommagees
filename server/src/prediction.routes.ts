import express, { Request, Response } from 'express';
import { AuthRequest } from './auth.routes'; // Import de l'interface existante
import { verifyToken } from './auth.routes';
import { collections } from './database';
import { Binary, ObjectId } from 'mongodb';
import { predictionResult } from './predictionResult';

export const predictionRouter = express.Router();
predictionRouter.use(express.json());

predictionRouter.post('/predict/create-prediction/:modelName', verifyToken, async (req: AuthRequest, res: Response) => {
    console.log('Route appelée avec modèle:', req.params.modelName);
    try {
        const expertId = req.userId; // récupéré depuis le token JWT
        //const {investigation_id, predicted_class,proba,timestamp} = req.body;
  
        // Lire le fichier d'image téléchargé
        
        const prediction:predictionResult = {
            expert_id: new ObjectId(expertId),
            investigation_id: new ObjectId(req.body.investigation_id),
            model: req.params.modelName,
            predicted_class: req.body.predicted_class,
            proba:  req.body.proba,
            timestamp:  new Date(req.body.timestamp)
        };
        const result = await collections.prediction!.insertOne(prediction);
    
        res.status(201).json({ message: 'Prediction créée', id: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
predictionRouter.get('/get-predictions/:investigationId', verifyToken, async (req: AuthRequest, res: Response) => {

  try {
      const investigationId = req.params.investigationId;
      if (!ObjectId.isValid(investigationId)) {
          return res.status(400).json({ message: 'ID d\'investigation invalide.' });
      }

      const predictions = await collections.prediction!
          .find({ investigation_id: new ObjectId(investigationId) })
          .sort({ timestamp: -1 }) // <-- tri du plus récent au plus ancien
          .toArray();

      if (predictions.length === 0) {
          return res.status(404).json({ message: 'Aucune prédiction trouvée pour cette enquête.' });
      }

      res.status(200).json(predictions);
  } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
  }
});


export default predictionRouter;
