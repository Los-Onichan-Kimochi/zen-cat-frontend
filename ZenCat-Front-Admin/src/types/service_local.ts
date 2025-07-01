export interface ServiceLocal {
  id: string;
  service_id: string;
  local_id: string;
}

export interface CreateServiceLocalRequest {
  service_id: string;
  local_id: string;
}

export interface DeleteServiceLocalRequest {
  service_id: string;
  local_id: string;
}