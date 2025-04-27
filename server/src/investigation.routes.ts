import express, { Request, Response } from 'express';
import {InvestigationDocument,InvestigationRequest} from './investigation';
import { AuthRequest } from './auth.routes'; // Import de l'interface existante
import { verifyToken } from './auth.routes';
import { collections } from './database';
import { Binary, ObjectId } from 'mongodb';
const fs = require('fs');
const multer = require('multer');

export const investigationRouter = express.Router();
investigationRouter.use(express.json());

const storage = multer.diskStorage({
    destination: function (_req:any, _file:any, cb:any) {
        cb(null, 'C:/Users/dell/Desktop/Investria/server/src/images');
    },
    filename: function (_req:any, _file:any, cb:any) {
        // Générer un nom de fichier unique
        cb(null, Date.now() + '-' + _file.originalname);
    }
});
const upload = multer({ storage: storage });
investigationRouter.post('/create-investigation', verifyToken,  upload.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const expertId = req.userId; // récupéré depuis le token JWT
        const {title, description} = req.body;
        const imageFile = req.file;
        if (!imageFile) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        // Lire le fichier d'image téléchargé
        const imageData = fs.readFileSync(imageFile.path);
        const imageBuffer = Buffer.from(imageData);
        const mimeType = imageFile.mimetype;
        
        const investigation:InvestigationDocument = {
          expert_id: new ObjectId(expertId),
          title: req.body.titre,
          description:req.body.description,
          createdAt: new Date(),
          status: "En cours",
          img_empr: {
            data: imageBuffer, // Insérer l'image en tant que Buffer
            contentType: mimeType // Stocker le type MIME de l'image
          }
        };
    
        const result = await collections.investigation!.insertOne(investigation);
    
        res.status(201).json({ message: 'Investigation créée', id: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
});
// PATCH /investigations/:id/validate
investigationRouter.patch('/investigations/:id/validate', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const investigationId = req.params.id;
    const { models, coment } = req.body;

    if (!Array.isArray(models) || typeof coment !== 'string') {
      return res.status(400).json({ message: 'Données de validation invalides' });
    }

    const updateResult = await collections.investigation!.updateOne(
      { _id: new ObjectId(investigationId) },
      {
        $set: {
          validation: {
            models,
            coment
          }
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Enquête non trouvée" });
    }

    res.status(200).json({ message: "Validation enregistrée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la validation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
investigationRouter.get('/investigations/ongoing', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const expertId = req.userId; // récupéré du token
    const investigations = await collections.investigation!.find({
      expert_id: new ObjectId(expertId),
      status: "En cours"
    }).sort({ timestamp: -1 }).toArray();
    res.status(200).json(investigations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
investigationRouter.get('/investigations/details/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const investigationId = req.params.id;
    const expertId = req.userId; // récupéré du token
    
    // Validation des IDs
    if (!ObjectId.isValid(investigationId) || !ObjectId.isValid(expertId!)) {
      return res.status(400).json({ message: 'ID invalide' });
    }

    const investigation = await collections.investigation!.findOne({
      _id: new ObjectId(investigationId),
      expert_id: new ObjectId(expertId)
    });

    if (!investigation) {
      return res.status(404).json({ 
        message: 'Investigation non trouvée ou vous n\'y avez pas accès' 
      });
    }

    // Sélection des champs à retourner (optionnel - pour la sécurité)
    //const { _id, title, description, status, createdAt, updatedAt } = investigation;

    res.status(200).json({
      success: true,
      investigation
    });

  } catch (error:any) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
investigationRouter.get('/investigations/archive', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const expertId = req.userId; // récupéré du token

    const investigations = await collections.investigation!.find({
      expert_id: new ObjectId(expertId),
      status: "Archivée",
    }).sort({ timestamp: -1 }).toArray() ;

    res.status(200).json(investigations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

investigationRouter.patch('/investigations/:id/archive', verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const result = await collections.investigation?.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'Archivée' } }
    );

    if (result?.modifiedCount === 1) {
      res.status(200).json({ message: 'Enquête archivée' });
    } else {
      res.status(404).json({ message: 'Enquête non trouvée ou déjà archivée' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'archivage :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
investigationRouter.delete('/investigations/:id', verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const result = await collections.investigation?.deleteOne({ _id: new ObjectId(id) });

    if (result?.deletedCount === 1) {
      res.status(200).json({ message: 'Enquête supprimée' });
    } else {
      res.status(404).json({ message: 'Enquête non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


export default investigationRouter;
