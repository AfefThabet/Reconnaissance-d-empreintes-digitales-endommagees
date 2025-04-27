export interface Investigation {
    _id?: string;
    expert_id: string;
    title: string;
    description: string;
    createdAt: Date;
    status: "En cours" | "Archivée";
    img_empr?: {
        data: string;       // Données de l'image sous forme de Buffer
        contentType: string; // Type MIME de l'image
    };
}
