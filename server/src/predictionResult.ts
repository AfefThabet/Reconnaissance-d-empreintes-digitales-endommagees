import * as mongodb from "mongodb";

export interface predictionResult {
    _id?: mongodb.ObjectId;
    expert_id?: mongodb.ObjectId;
    investigation_id?: mongodb.ObjectId;
    model: string;
    predicted_class: number;
    proba: number;
    timestamp: Date;
}