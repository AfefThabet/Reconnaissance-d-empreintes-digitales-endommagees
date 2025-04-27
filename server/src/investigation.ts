import * as mongodb from "mongodb";

// Interface pour la requête HTTP (body)
export interface InvestigationRequest {
  expert_id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: "En cours" | "Archivée";
  img_empr: {
    data: string; // Base64 (reçu du frontend)
    contentType: string;
  };
}

// Interface pour le document MongoDB
export interface InvestigationDocument {
  _id?: mongodb.ObjectId;
  expert_id: mongodb.ObjectId;
  title: string;
  description: string;
  createdAt: Date;
  status: "En cours" | "Archivée";
  img_empr?: {
    data: Buffer;       // Données de l'image sous forme de Buffer
    contentType: string; // Type MIME de l'image
  };
  validation?: {
    models: string[];    
    coment: string;
  };
}