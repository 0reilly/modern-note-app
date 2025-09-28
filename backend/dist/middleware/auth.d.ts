import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authenticateSocket: (socket: Socket, next: (err?: Error) => void) => void;
export {};
//# sourceMappingURL=auth.d.ts.map