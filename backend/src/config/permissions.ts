
export type Rol =
  | 'SOCIO'
  | 'TESORERO'
  | 'COMITE'
  | 'AUDITOR'
  | 'ADMIN';

export type Permission =
  // Ahorro
  | 'ahorro:consultar-propio'
  | 'ahorro:aportar'
  | 'ahorro:consultar-global'
  | 'ahorro:registrar-movimientos'
  | 'ahorro:conciliar'

  // Préstamos
  | 'prestamos:solicitar'
  | 'prestamos:simular'
  | 'prestamos:consultar-propio'
  | 'prestamos:consultar-solicitudes'
  | 'prestamos:evaluar'
  | 'prestamos:votar'
  | 'prestamos:consultar-decisiones'
  | 'prestamos:desembolsar'

  // Pagos
  | 'pagos:realizar-propio'
  | 'pagos:aplicar'
  | 'pagos:consultar'

  // Contabilidad y reportes
  | 'contabilidad:consultar'
  | 'contabilidad:registrar'
  | 'reportes:consultar'
  | 'reportes:generar'
  | 'cierres:ejecutar'

  // Auditoría
  | 'auditoria:consultar'

  // Administración
  | 'usuarios:administrar'
  | 'roles:administrar'
  | 'configuracion:administrar'
  | 'catalogos:administrar'
  | 'documentos:administrar'
  | 'notificaciones:administrar';

export const ROLE_PERMISSIONS: Record<
  Rol,
  readonly (Permission | '*')[]
> = {
  SOCIO: [
    'ahorro:consultar-propio',
    'ahorro:aportar',
    'prestamos:solicitar',
    'prestamos:simular',
    'prestamos:consultar-propio',
    'pagos:realizar-propio',
  ],

  TESORERO: [
    'ahorro:consultar-global',
    'ahorro:registrar-movimientos',
    'ahorro:conciliar',
    'prestamos:consultar-solicitudes',
    'prestamos:desembolsar',
    'pagos:aplicar',
    'pagos:consultar',
    'contabilidad:consultar',
    'contabilidad:registrar',
    'reportes:consultar',
    'reportes:generar',
    'cierres:ejecutar',
  ],

  COMITE: [
    'prestamos:consultar-solicitudes',
    'prestamos:evaluar',
    'prestamos:votar',
    'prestamos:consultar-decisiones',
  ],

  AUDITOR: [
    'ahorro:consultar-global',
    'pagos:consultar',
    'contabilidad:consultar',
    'reportes:consultar',
    'auditoria:consultar',
  ],

  ADMIN: ['*'],
};

export const hasPermission = (
  rol: string,
  permission: Permission,
): boolean => {
  if (!Object.hasOwn(ROLE_PERMISSIONS, rol)) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[rol as Rol];

  return (
    permissions.includes('*') ||
    permissions.includes(permission)
  );
};
