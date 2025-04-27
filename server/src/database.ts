import * as mongodb from "mongodb";
import { userAuth } from "./userAuth";
import { expertinfo } from "./expertInfo";
import { InvestigationDocument } from "./investigation";
import { predictionResult } from "./predictionResult";

export const collections: {
    user_auth?: mongodb.Collection<userAuth>;
    expert_info?: mongodb.Collection<expertinfo>;
    investigation?: mongodb.Collection<InvestigationDocument>;
    prediction?: mongodb.Collection<predictionResult>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("Investria");
    await applySchemaValidation(db);
    await recreateUniqueIndex(db);  
    //await recreateUniqueIndexProducts(db);  
    
    const expertinfoCollection = db.collection<expertinfo>("expert_info");
    const userAuthCollection = db.collection<userAuth>("user_auth");
    const investigationCollection = db.collection<InvestigationDocument>("investigation");
    const predictionCollection = db.collection<predictionResult>("prediction");

    collections.expert_info = expertinfoCollection;
    collections.user_auth = userAuthCollection;
    collections.investigation = investigationCollection;
    collections.prediction = predictionCollection;
}

async function applySchemaValidation(db: mongodb.Db) {


    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password","phone"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string",
                    minLength: 6
                },
                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string",
                },
                phone: {
                    bsonType: "string",
                    description: "'phone' is required and is a string",
                }
            },
        },
    };

    const userAuthSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "email", "password"],
            additionalProperties: false,
            properties: {
                _id: {},
                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string",
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string",
                    minLength: 6
                },
                role: {
                    bsonType: "string",
                    description: "'role' is required and can only be 'expert'",
                    enum: ["expert","admin"],
                }
            },
        },
    };

    const expertinfoSchema = {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "first_name",
            "last_name",
            "cin",
            "matricule",
            "grade",
            "agence_ratt",
            "service"
          ],
          additionalProperties: false,
          properties: {
            _id: {}, // laissé vide, MongoDB le gère automatiquement
            user_auth_id: {
              bsonType: "objectId",
              description: "'user_auth_id' doit être un ObjectId"
            },
            first_name: {
              bsonType: "string",
              description: "'first_name' est requis et doit être une chaîne de caractères"
            },
            last_name: {
              bsonType: "string",
              description: "'last_name' est requis et doit être une chaîne de caractères"
            },
            cin: {
              bsonType: "int",
              description: "'cin' est requis et doit être un entier"
            },
            matricule: {
              bsonType: "string",
              description: "'matricule' est requis et doit être une chaîne de caractères"
            },
            grade: {
              bsonType: "string",
              description: "'grade' est requis et doit être une chaîne de caractères"
            },
            agence_ratt: {
              bsonType: "string",
              description: "'agence_ratt' est requis et doit être une chaîne de caractères"
            },
            service: {
              bsonType: "string",
              description: "'service' est requis et doit être une chaîne de caractères"
            },
            image: {
                bsonType: "object",
                required: ["data", "contentType"],
                properties: {
                  data: {
                    bsonType: "binData"
                  },
                  contentType: {
                    bsonType: "string"
                  }
                }
              }
          }
        }
      };

    const investigationSchema = {
        $jsonSchema: {
          bsonType: "object",
          required: ["expert_id", "title", "createdAt", "status", "img_empr"],
          additionalProperties: false,
          properties: {
            _id: {},
            expert_id: {},
            title: {
              bsonType: "string",
              description: "Titre requis (3 caractères minimum)"
            },
            description: {
              bsonType: "string",
              description: "Description requise (10 caractères minimum)"
            },
            createdAt: {
              bsonType: "date",
              description: "Date de création requise"
            },
            status: {
              enum: ["En cours", "Archivée"],
              description: "Statut doit être 'En cours' ou 'Archivée'"
            },
            img_empr: {
              bsonType: "object",
              required: ["data", "contentType"],
              properties: {
                data: {
                  bsonType: "binData"
                },
                contentType: {
                  bsonType: "string"
                }
              }
            },
            validation: {
              bsonType: "object",
              required: ["models", "coment"],
              properties: {
                models: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  },
                  description: "Liste des modèles validés"
                },
                coment: {
                  bsonType: "string",
                  description: "Commentaire de validation"
                }
              }
            }
          }
        }
      };
      
      const predictionSchema = {
        $jsonSchema: {
          bsonType: "object",
          required: ["model", "predicted_class", "proba", "timestamp"],
          additionalProperties: false,
          properties: {
            _id: {},
            expert_id: {},
            investigation_id: {},
            model: {
              bsonType: "string",
              description: "Nom du modèle ML utilisé"
            },
            predicted_class: {
              bsonType: "int",
              minimum: 0,
              description: "Classe prédite par le modèle"
            },
            proba: {
              bsonType: "int",
              minimum: 0,
              maximum: 100,
              description: "Probabilité associée à la prédiction en %"
            },
            timestamp: {
              bsonType: "date",
              description: "Date de la prédiction"
            }
          }
        }
      };
      
      
    
    // Create or modify user_auth collection
    await db.command({
        collMod: "user_auth",
        validator: userAuthSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("user_auth", { validator: userAuthSchema });
        }
    });

    // Create or modify user_info collection
    await db.command({
        collMod: "expert_info",
        validator: expertinfoSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("expert_info", { validator: expertinfoSchema });
        }
    });

    await db.command({
        collMod: "investigation",
        validator: investigationSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("investigation", { validator: investigationSchema });
        }
    });

    await db.command({
        collMod: "prediction",
        validator: predictionSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("prediction", { validator: predictionSchema });
        }
    });
}

async function recreateUniqueIndex(db: mongodb.Db): Promise<void> {
  try {
      const collection = db.collection("user_auth");
      // Créer un nouvel index unique
      await collection.createIndex({ email: 1 }, { unique: true });
  } catch (error) {
      console.error("Error recreating unique index on email:", error);
      throw error;
  }
}


/*async function recreateUniqueIndexProducts(db: mongodb.Db): Promise<void> {
    try {
        // Créer l'index unique sur provider_id et reference
        await db.collection("products").createIndex({ provider_id: 1, reference: 1 }, { unique: true });
        //console.log("Unique index recreated successfully on provider_id and reference.");
    } catch (error) {
        console.error("Error creating unique index on provider_id and reference:", error);
        throw error; // Propager l'erreur pour une gestion ultérieure
    }
}*/


