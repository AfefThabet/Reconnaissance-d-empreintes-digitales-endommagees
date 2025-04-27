export interface PredictionResult {
    _id?: string;
    expert_id?: string;
    investigation_id?: string;
    model: string;
    predicted_class: number;
    proba: number;
    img_empr?: {
        data: string;       // Données de l'image sous forme de Buffer
        contentType: string; // Type MIME de l'image
    };
    timestamp: string | Date;
    
}