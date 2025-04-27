import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { user } from "./user";
import { AuthRequest } from "./auth.routes";
import { expertinfo } from "./expertInfo";
import { userAuth } from "./userAuth";
import bcrypt from 'bcrypt';
const fs = require('fs');
const multer = require('multer');

export const userRouter = express.Router();
userRouter.use(express.json());


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

userRouter.get("/clients", async (_req, res) => {
    try {
        const users = await collections?.expert_info?.find({}).toArray();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "Unknown error");
    }
});

userRouter.post("/registerexpert", upload.single('image'),async (req, res) => {
    try {
        const user = req.body;
        const imageFile = req.file;
        if (!imageFile) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
          const userAuthResult = await collections.user_auth!.insertOne({
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
          });
          const userAuthId = userAuthResult.insertedId;
          const cin = parseInt(req.body.cin, 10);
          if (isNaN(cin)) {
            return res.status(400).json({ message: "Le champ CIN est invalide." });
          }
          const userInfoResult = await collections.expert_info!.insertOne({
            user_auth_id: userAuthId,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            cin: cin,
            matricule: req.body.matricule,
            grade: req.body.grade,
            agence_ratt: req.body.agence_ratt,
            service: req.body.service,
            image: {
              data: fs.readFileSync(req.file!.path),
              contentType: req.file!.mimetype
            }
          });
    
        if (userInfoResult?.acknowledged && userAuthResult?.acknowledged) {
            res.status(201).json({ message:`Created a new user: ID ${userAuthResult.insertedId}.`});
        } else {
           res.status(500).json({ message:"Failed to create a new user."});
        }
    } catch (error: any) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            // Afficher un message d'erreur spécifique à l'utilisateur
            console.error("Error inserting user:", error);
            res.status(409).send("Cet email est déjà utilisé. Veuillez utiliser un autre email.");
        } else{
            console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
        }    
    }
})
