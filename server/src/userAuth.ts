import * as mongodb from "mongodb";

export interface userAuth {
    _id?: mongodb.ObjectId,
    email: string,
    password: string,
    role:string
}