import { Request } from "express";
export interface AuthTokenPayload {
    userId: string;
    email: string;
    username: string;
}

export interface RequestWithAuth extends Request {
    user: AuthTokenPayload;
}
