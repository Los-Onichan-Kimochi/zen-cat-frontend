export interface ServiceProfessional {
  id: string;
  service_id: string;
  professional_id: string;
}

export interface CreateServiceProfessionalRequest {
  service_id: string;
  professional_id: string;
}

export interface DeleteServiceProfessionalRequest {
  service_id: string;
  professional_id: string;
}