import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.middleware.js';
import {
  hasPermission,
  type Permission,
} from '../config/permissions.js';

export const authorizePermissions = (
  ...requiredPermissions: Permission[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.usuario) {
      res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const { rol } = authenticatedReq.usuario;

    const authorized = requiredPermissions.every((permission) =>
      hasPermission(rol, permission),
    );

    if (!authorized) {
      res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta operación',
      });
      return;
    }

    next();
  };
};