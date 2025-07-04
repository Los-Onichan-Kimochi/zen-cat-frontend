// Tipos para el ubigeo de Perú
export interface Region {
  id: string;
  name: string;
}

export interface Provincia {
  id: string;
  name: string;
  department_id: string;
}

export interface Distrito {
  id: string;
  name: string;
  department_id: string;
  province_id: string;
} 