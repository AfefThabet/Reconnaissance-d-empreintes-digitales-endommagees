import * as mongodb from "mongodb";

export interface expertinfo {
    _id?: mongodb.ObjectId,
    user_auth_id?:mongodb.ObjectId,
    first_name:String,
    last_name:String,
    cin:number,
    matricule:String,
    grade:String,
    agence_ratt:String,
    service:String,
    image?: {
        data: Buffer;       // Données de l'image sous forme de Buffer
        contentType: string; // Type MIME de l'image
    }
    imageUrl?:string
}