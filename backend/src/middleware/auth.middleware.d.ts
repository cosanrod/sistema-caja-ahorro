import type { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id: string;
        email: string;
        rol: string;
    };
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map