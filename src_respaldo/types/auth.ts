export interface RolAsignado {
    asignacion_id: number;
    codigo: string;
    nombre: string;
    icono: string;
    color: string;
    etiqueta: string;
    ruta_dashboard: string;
}

export interface RespuestaCedula {
    ok: boolean;
    token?: string;
    nombreCompleto?: string;
    cantidadRoles?: number;
    msg?: string;
}

export interface RespuestaContrasena {
    ok: boolean;
    redirigir?: boolean;
    rol?: RolAsignado;
    roles?: RolAsignado[];
    sessionToken?: string;
    msg?: string;
}

export interface RespuestaRol {
    ok: boolean;
    rol?: RolAsignado;
    sessionToken?: string;
    msg?: string;
}
