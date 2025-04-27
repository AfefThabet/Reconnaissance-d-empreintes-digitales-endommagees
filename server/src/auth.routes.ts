import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { user } from "./user";
import { userAuth } from "./userAuth";
import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import { Request, Response, NextFunction } from 'express';
import * as mongodb from "mongodb";
import bcrypt from 'bcrypt';

const fs = require('fs');
const multer = require('multer');

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

export const authRouter = express.Router();
authRouter.use(express.json());

export interface AuthRequest extends Request {
    userId?: mongodb.ObjectId; // Define userId as an optional number property
    userRole?: 'expert';
}

const tokenKey = 'auth_token';

export function generateToken(user: userAuth): string {
    const token = jwt.sign(
        { userId: user._id, email: user.email,userRole: user.role }, // Payload du token (données que vous souhaitez inclure)
        tokenKey, // Clé secrète pour signer le token
        { expiresIn: '1h' } // Optionnel : expiration du token (1 heure dans cet exemple)
    );
    return token;
}


authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user_auth = await collections?.user_auth?.findOne({ email });
        if (!user_auth) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Vérifier le mot de passe avec bcrypt
        const isMatch = await bcrypt.compare(password, user_auth.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        var user_info: any;
        if (user_auth.role === "expert") {
            user_info = await collections?.expert_info?.findOne({ user_auth_id: user_auth._id });
            if (user_info?.image?.data && user_info?.image?.contentType) {
                const base64Image = user_info.image.data.toString('base64');
                const mimeType = user_info.image.contentType;
                user_info.imageUrl = `data:${mimeType};base64,${base64Image}`;
            }
        }
        if (!user_info) {
            return res.status(401).json({ message: 'Error while fetching user info' });
        }
        const user = { user_auth, user_info };
        const token = generateToken(user_auth);
        res.status(200).json({ token: token, user });
    } catch (error) {
        res.status(401).json({ message: 'Failed to generate token' });
    }
});

// Middleware function to verify JWT
export function verifyToken(req:AuthRequest, res: Response, next: NextFunction) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        try {
            const decoded = jwt.verify(token, tokenKey) as { userId: number , userRole: 'expert'};

            req.userId = new ObjectId(decoded.userId); 
            req.userRole = decoded.userRole;
            next(); // Call next middleware or route handler
        } catch (error) {
            console.error('JWT verification error:', error);
            res.sendStatus(403); // Forbidden
        }
    } else {
        res.sendStatus(404); // Forbidden
    }
}


// Endpoint to update user info
authRouter.put('/profile/update', verifyToken, upload.single('image'), async (req: AuthRequest, res) => {
    const user_auth_id = req.userId;
    const { email } = req.body;
    const imageFile = req.file;
  
    try {
      let user_info = null;
      let expert_info = null;
  
      // Mise à jour de l'email
      if (email) {
        await collections?.user_auth?.updateOne(
          { _id: user_auth_id },
          { $set: { email } }
        );
        user_info = await collections?.user_auth?.findOne({ _id: user_auth_id });
      }
  
      // Mise à jour de l'image
      if (imageFile) {
        const imageData = fs.readFileSync(imageFile.path);
        const imageBuffer = Buffer.from(imageData);
        const mimeType = imageFile.mimetype;
  
        await collections?.expert_info?.updateOne(
          { user_auth_id: user_auth_id },
          { $set: { image: { data: imageBuffer, contentType: mimeType } } }
        );
        expert_info = await collections?.expert_info?.findOne({ user_auth_id: user_auth_id });
      }
      if (expert_info?.image?.data && expert_info?.image?.contentType) {
        const base64Image = expert_info.image.data.toString('base64');
        const mimeType = expert_info.image.contentType;
        expert_info.imageUrl = `data:${mimeType};base64,${base64Image}`;
      }
      if (!user_info && !expert_info) {
        return res.status(404).json({ message: 'Aucune donnée mise à jour' });
      }
  
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user_info,
        expert_info
      });
  
    } catch (error) {
      console.error('Error updating user info:', error);
      res.status(500).json({ message: 'Failed to update user info' });
    }
  });
  
  
// Endpoint to update user password
authRouter.put('/update_password', verifyToken, async (req: AuthRequest, res) => {
    const { current_password, new_password } = req.body;
    const user_auth_id = req.userId;
    try {
        // Find user_auth document to verify current password
        const userAuth = await collections?.user_auth?.findOne({ _id: new ObjectId(user_auth_id) });
        if (!userAuth) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password matches
        if (userAuth.password !== current_password) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        // Update user_auth collection with new password
        const updatedUserAuth = await collections?.user_auth?.findOneAndUpdate(
            { _id: new ObjectId(user_auth_id) },
            { $set: { password: hashedPassword } },
            { returnDocument: 'after' }
        );

        if (!updatedUserAuth) {
            return res.status(404).json({ message: 'Failed to update password' });
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});



