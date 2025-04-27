import * as mongodb from "mongodb";
import { userAuth } from "./userAuth";
import { expertinfo } from "./expertInfo";

/*export interface user {
    name: string;
    email: string;
    password: string;
    phone:string,
    _id?: mongodb.ObjectId;
}*/
export interface user {
    user_auth: userAuth,
    user_info: expertinfo
}