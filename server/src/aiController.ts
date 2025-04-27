import * as express from "express";
import axios from 'axios';
import FormData from 'form-data';
import { collections } from './database';
import multer from 'multer';
import { AuthRequest } from './auth.routes';
import { verifyToken } from './auth.routes';
import { Response } from 'express';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() });
export const aipredictionRouter = express.Router();

// 1. Configuration des modèles
enum MLModels {
  VGG16 = 'Fing-VGG16',
  INCEPTION = 'Fing-InceptionV3'
}

const MODEL_CONFIG = {
  [MLModels.VGG16]: {
    endpoint: 'http://localhost:5000/predict/Fing-VGG16',
    timeout: 60000,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  [MLModels.INCEPTION]: {
    endpoint: 'http://localhost:5000/predict/Fing-InceptionV3',
    timeout: 60000,
    maxFileSize: 5 * 1024 * 1024
  }
};

// 2. Middleware de vérification de modèle
const validateModel = (req: express.Request, res: Response, next: express.NextFunction) => {
  const model = req.params.modelName as MLModels;
  if (!MODEL_CONFIG[model]) {
    return res.status(400).json({
      error: 'Modèle non supporté',
      supportedModels: Object.values(MLModels)
    });
  }
  next();
};

// 3. Interface étendue
interface ExtendedFormData extends FormData {
  getHeaders(): Record<string, string>;
  getLengthSync(): number;
}

// 4. Route unique pour tous les modèles
aipredictionRouter.post('/predict/:modelName',
  verifyToken,
  validateModel,
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      // Vérification du fichier
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Aucun fichier uploadé',
          code: 'MISSING_FILE'
        });
      }

      // Récupération de la configuration
      const modelName = req.params.modelName as MLModels;
      const config = MODEL_CONFIG[modelName];

      // Vérification de la taille du fichier
      if (req.file.size > config.maxFileSize) {
        return res.status(413).json({
          error: 'Fichier trop volumineux',
          maxSize: config.maxFileSize,
          currentSize: req.file.size
        });
      }

      // Authentification utilisateur
      const user = await collections.user_auth?.findOne({ _id: req.userId });
      if (!user) {
        return res.status(401).json({
          error: 'Utilisateur non autorisé',
          code: 'UNAUTHORIZED'
        });
      }

      // Préparation du flux de données
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);

      // Création du FormData
      const formData = new FormData() as ExtendedFormData;
      formData.append('file', bufferStream, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size
      });

      // Headers personnalisés
      const headers = {
        ...formData.getHeaders(),
        'X-User-ID': req.userId?.toString(),
        'X-Model-Version': modelName
      };

      // Appel au service ML
      const response = await axios.post(config.endpoint, formData, {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: config.timeout
      });

      // Journalisation (optionnelle)
      /*
      await collections.predictions?.insertOne({
        userId: req.userId,
        model: modelName,
        filename: req.file.originalname,
        result: response.data,
        date: new Date()
      });
      */

      // Réponse standardisée
      res.json({
        success: true,
        model: modelName,
        inferenceTime: response.headers['x-inference-time'],
        data: response.data,
        userMetadata: {
          role: user.role,
          email: user.email
        },
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`Erreur [${req.params.modelName}]:`, error);
      
      const statusCode = axios.isAxiosError(error) 
        ? error.response?.status || 500 
        : 500;

      const errorResponse = {
        error: "Erreur de prédiction",
        code: `PREDICTION_FAILED_${statusCode}`,
        model: req.params.modelName,
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      };

      res.status(statusCode).json(errorResponse);
    }
  }
);
/*import * as express from "express";
import axios from 'axios';
import FormData from 'form-data';
import { collections } from './database';
import multer from 'multer';
import { AuthRequest } from './auth.routes';
import { verifyToken } from './auth.routes';
import { Response } from 'express';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() });
export const predictionRouter = express.Router();

enum MLModels {
  VGG16 = 'Fing-VGG16',
  RESNET = 'Fing-ResNet50',
  INCEPTION = 'Fing-InceptionV3'
}

const MODEL_CONFIG = {
  [MLModels.VGG16]: {
    endpoint: 'http://localhost:5000/predict/Fing-VGG16',
    timeout: 60000,
    maxFileSize: 10 * 1024 * 1024
  },
  [MLModels.RESNET]: {
    endpoint: 'http://localhost:5001/predict/Fing-ResNet50',
    timeout: 45000,
    maxFileSize: 8 * 1024 * 1024
  },
  [MLModels.INCEPTION]: {
    endpoint: 'http://localhost:5002/predict/Fing-InceptionV3',
    timeout: 30000,
    maxFileSize: 5 * 1024 * 1024
  }
};

interface ExtendedFormData extends FormData {
  getHeaders(): Record<string, string>;
  getLengthSync(): number;
}

predictionRouter.post('/predict/:modelName',
  verifyToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      // Validation du modèle
      const modelName = req.params.modelName as MLModels;
      const config = MODEL_CONFIG[modelName];
      if (!config) {
        return res.status(400).json({
          error: 'Modèle non supporté',
          supportedModels: Object.values(MLModels)
        });
      }

      // Vérification fichier
      if (!req.file) return res.status(400).json({ error: 'Aucun fichier uploadé' });
      if (req.file.size > config.maxFileSize) {
        return res.status(413).json({
          error: 'Fichier trop volumineux',
          maxSize: config.maxFileSize,
          currentSize: req.file.size
        });
      }

      // Vérification utilisateur
      const user = await collections.user_auth?.findOne({ _id: req.userId });
      if (!user) return res.status(401).json({ error: 'Non autorisé' });

      // Préparation requête
      const formData = new FormData() as ExtendedFormData;
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      
      formData.append('file', bufferStream, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size
      });

      // Appel au modèle ML
      const response = await axios.post(config.endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'X-User-ID': req.userId?.toString(),
          'X-Model-Version': modelName
        },
        timeout: config.timeout
      });

      // Réponse standardisée
      res.json({
        success: true,
        model: modelName,
        confidence: response.data.confidence,
        features: response.data.features,
        processingTime: response.headers['x-inference-time'],
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`Erreur prédiction [${req.params.modelName}]:`, error);
      
      const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      
      res.status(status).json({
        error: "Échec prédiction",
        code: `MODEL_ERR_${status}`,
        details: message
      });
    }
  }
);*/
/*import * as express from "express";
import axios from 'axios';
import FormData from 'form-data';
import { collections } from './database'; // Import des collections MongoDB
import multer from 'multer'; // Ajout pour le traitement des fichiers
import { AuthRequest } from './auth.routes'; // Import de l'interface existante
import { verifyToken } from './auth.routes';
import { Response} from 'express';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() });
export const predictionRouter = express.Router();

interface ExtendedFormData extends FormData {
  getHeaders(): Record<string, string>;
  getLengthSync(): number;
}

predictionRouter.post('/predict/Fing-VGG16', verifyToken,upload.single('file'),async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Aucun fichier uploadé',
        code: 'MISSING_FILE'
      });
    }
    
    const user = await collections.user_auth?.findOne({ 
      _id: req.userId 
    });

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non autorisé',
        code: 'UNAUTHORIZED'
      });
    }
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    const formData = new FormData() as ExtendedFormData;
    formData.append('file', bufferStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: req.file.size
    });

    const axiosConfig = {
      headers: {
        ...formData.getHeaders(),
        'Content-Length': formData.getLengthSync(),
        'X-User-ID': req.userId?.toString()
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000
    };

    const response = await axios.post('http://localhost:5000/predict/Fing-VGG16', 
      formData,
      axiosConfig
    );
    Commenté : Journalisation des prédictions
    await collections.predictions?.insertOne({
      userId: req.userId,
      filename: req.file.originalname,
      result: response.data,
      date: new Date()
    });
    

    res.json({
      success: true,
      data: response.data,
      user: {
        role: user.role,
        email: user.email
      }
    });
  
  } catch (error) {
    console.error('Erreur de prédiction:', error);
    
    const statusCode = axios.isAxiosError(error) 
      ? (error.response?.status || 500)
      : 500;

    res.status(statusCode).json({
      error: "Erreur lors de la prédiction",
      code: 'PREDICTION_FAILED',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error 
        ? error.stack 
        : undefined
    });
  }
}
);*/

/*import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';

export const predict = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Création du FormData avec le type correct
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Solution 1 : Utiliser le type étendu
   const headers = {
      ...(formData as any).getHeaders(), // Type assertion temporaire
      'Content-Length': (formData as any).getLengthSync()
    };

    // Solution 2 : Alternative plus propre avec type personnalisé
    interface ExtendedFormData extends FormData {
      getHeaders(): Record<string, string>;
      getLengthSync(): number;
    }
    
    const typedFormData = formData as ExtendedFormData;
    const safeHeaders = {
      ...typedFormData.getHeaders(),
      'Content-Length': typedFormData.getLengthSync()
    };

    const response = await axios.post('http://localhost:5000/predict', formData, {
      headers: safeHeaders
    });

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      error: "Erreur lors de la prédiction",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};*/ 