export interface Local{
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
export interface CreateLocalPayload{
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

export type UpdateLocalPayloadLocal = Partial<CreateLocalPayload>;