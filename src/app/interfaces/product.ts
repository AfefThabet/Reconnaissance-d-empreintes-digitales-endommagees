export interface Product {
    _id?: string,
    reference: string;
    label: string;
    type: "Achat" | "Location";
    category: string;
    description: string;
    tags: string[];
    price_per_unit: number;
    unit: string;
    availability: boolean;
    provider_id: string;
    creation_date: Date;
    image?: {
        data: Buffer;       // Données de l'image sous forme de Buffer
        contentType: string; // Type MIME de l'image
    };
}
