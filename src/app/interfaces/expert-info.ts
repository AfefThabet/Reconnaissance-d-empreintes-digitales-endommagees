export interface expertinfo {
    _id?: String,
    user_auth_id:String,
    first_name:String,
    last_name:String,
    cin:Number,
    matricule:String,
    grade:String,
    agence_ratt:String,
    service:String,
    image?: {
        data: string;       // Données de l'image sous forme de Buffer
        contentType: string; // Type MIME de l'image
    }
    imageUrl?:string
}
