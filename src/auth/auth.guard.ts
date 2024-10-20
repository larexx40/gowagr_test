import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthTokenPayload, RequestWithAuth } from 'src/types/auth.type';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {    
        const request:RequestWithAuth = context.switchToHttp().getRequest();
        
        const authorizationHeader = request?.headers['authorization'];
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authorizationHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET_KEY) as AuthTokenPayload; // Use jsonwebtoken to verify
            request.user = payload; // Attach the payload to the request
            return true;
        } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
        }
    }
}