export interface Local {
  id: string;
  local_name: string;
  street_name: string;
  building_number: string;
  district: string;
  province: string;
  region: string;
  reference: string;
  capacity: number;
  image_url: string;
}

// Tipos para los payloads de creación y actualización
export interface CreateLocalPayload {
  //id: string;
  local_name: string;
  street_name: string;
  building_number: string;
  district: string;
  province: string;
  region: string;
  reference: string;
  capacity: number;
  image_url: string;
}

export type UpdateLocalPayload = Partial<CreateLocalPayload>;

export interface BulkCreateLocalPayload {
  locals: CreateLocalPayload[];
}

export interface BulkDeleteLocalPayload {
  locals: string[]; // array of locals IDs
}

export type Region = {
  id: string;
  name: string;
};

export type Provincia = {
  id: string;
  name: string;
  department_id: string;
};

export type Distrito = {
  id: string;
  name: string;
  province_id: string;
  department_id: string;
};
