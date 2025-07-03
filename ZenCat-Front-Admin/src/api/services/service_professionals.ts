import {
  ServiceProfessional,
  CreateServiceProfessionalRequest,
  DeleteServiceProfessionalRequest,
} from '@/types/service_professional';
import { Professional } from '@/types/professional';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { professionalsApi } from '@/api/professionals/professionals';

export const serviceProfessionalApi = {
  // List all associations (optionally filtered)
  fetchServiceProfessionals: async (params?: {
    serviceId?: string;
    professionalId?: string;
  }): Promise<ServiceProfessional[]> => {
    const query = new URLSearchParams();
    if (params?.serviceId) query.append('serviceId', params.serviceId);
    if (params?.professionalId)
      query.append('professionalId', params.professionalId);

    const endpoint = `${API_ENDPOINTS.SERVICE_PROFESSIONALS.BASE}?${query.toString()}`;
    const data = await apiClient.get<any>(endpoint);

    if (data && Array.isArray(data.service_professionals)) {
      return data.service_professionals;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from service-professional API');
  },

  // Get a specific association
  getServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<ServiceProfessional> => {
    return apiClient.get<ServiceProfessional>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BY_IDS(serviceId, professionalId),
    );
  },

  // Create a new association
  createServiceProfessional: async (
    payload: CreateServiceProfessionalRequest,
  ): Promise<ServiceProfessional> => {
    return apiClient.post<ServiceProfessional>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BASE,
      payload,
    );
  },

  // Bulk create
  bulkCreateServiceProfessionals: async (payload: {
    service_professionals: CreateServiceProfessionalRequest[];
  }): Promise<ServiceProfessional[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BULK,
      payload,
    );
    return data.service_professionals;
  },

  // Delete one
  deleteServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BY_IDS(serviceId, professionalId),
    );
  },

  // Bulk delete
  bulkDeleteServiceProfessionals: async (payload: {
    service_professionals: DeleteServiceProfessionalRequest[];
  }): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BULK,
      payload,
    );
  },

  // Fetch service professionals with additional filtering
  fetchFilteredProfessionals: async (
    serviceId: string,
    isVirtual: boolean,
    professionalApi = professionalsApi
  ): Promise<Professional[]> => {
    try {
      console.log(`Fetching filtered professionals for service ${serviceId}, isVirtual: ${isVirtual}`);
      const professionals: Professional[] = [];
      // 1. Get service-professional associations
      if( isVirtual ) {
        const serviceProfessionals = await serviceProfessionalApi.fetchServiceProfessionals({
          serviceId: serviceId
        });
        
        // 2. Extract professional IDs
        const professionalIds = serviceProfessionals.map(sp => sp.professional_id);
        console.log(`Found ${professionalIds.length} professionals associated with service`);
        
        if (professionalIds.length === 0) {
          return [];
        }
        
        // 3. Get detailed professional information
        
        const filteredOutProfessionals: Professional[] = [];
        
        for (const id of professionalIds) {
          try {
            const professional = await professionalApi.getProfessionalById(id);
            
            // 4. For non-virtual services, filter out MEDIC type professionals
            if ( professional.type == 'MEDIC') {
              professionals.push(professional);
            } else {
              filteredOutProfessionals.push(professional);
              console.log(`Filtered out professional ${professional.name} (${professional.id}) of type ${professional.type} for non-virtual service`);
            }
          } catch (error) {
            console.error(`Error fetching professional ${id}:`, error);
          }
        }
        
        console.log(`Returning ${professionals.length} professionals, filtered out ${filteredOutProfessionals.length} MEDIC professionals`);
        
      }
      else {
        // For non-virtual services, fetch all professionals
        const allProfessionals = await professionalApi.getProfessionals();
        console.log(`Fetched ${allProfessionals.length} total professionals`);

        // Filter out MEDIC type professionals
        for (const professional of allProfessionals) {
          if (professional.type !== 'MEDIC') {
            professionals.push(professional);
          } else {
            console.log(`Filtered out professional ${professional.name} (${professional.id}) of type ${professional.type}`);
          }
        }
        
        console.log(`Returning ${professionals.length} professionals after filtering`);
      }

      return professionals;
    } catch (error) {
      console.error("Error fetching filtered professionals:", error);
      return [];
    }
  }
};
