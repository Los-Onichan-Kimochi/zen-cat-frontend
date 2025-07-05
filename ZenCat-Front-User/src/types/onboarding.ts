
// Document types that match the backend enum
export type DocumentType = 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';

// Gender types that match the backend enum
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';


export interface UpdateOnboardingRequest {
  document_type?: DocumentType;
  document_number?: string;
  phone_number?: string;
  postal_code?: string;
  address?: string;
  updated_by?: string;
  district?: string;
  province?: string;
  region?: string;
  birth_date?: string | null;
  gender?: Gender | null;
}

// Request interface for creating onboarding data - matching Go backend
export interface CreateOnboardingRequest {
  // Required fields
  document_type: DocumentType;
  document_number: string;
  phone_number: string;
  postal_code: string;
  address: string;
  updated_by: string; // Required by backend
  district: string; // Required by backend (not null)
  province: string; // Required by backend (not null)
  region: string; // Required by backend (not null)

  // Optional fields
  birth_date?: string; // Format: ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
  gender?: Gender; // Direct enum value
}

// Response interface for onboarding data
export interface OnboardingResponse {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string;
  phone_number: string;
  birth_date?: string | null;
  gender?: Gender | null;
  postal_code: string;
  address: string;
  district: string; // Required
  province: string; // Required
  region: string; // Required
  created_at?: string;
  updated_at?: string;
}

// Helper to convert frontend OnboardingData to API request
export function convertOnboardingDataToRequest(
  data: {
    documentType?: string;
    documentNumber?: string;
    phoneNumber?: string;
    birthDate?: string;
    gender?: string;
    postalCode?: string;
    address?: string;
    district?: string;
    province?: string;
    region?: string;
  },
  userId: string,
): CreateOnboardingRequest {
  // Validate required fields
  const missingFields = [];
  if (!data.documentType?.trim()) missingFields.push('documentType');
  if (!data.documentNumber?.trim()) missingFields.push('documentNumber');
  if (!data.phoneNumber?.trim()) missingFields.push('phoneNumber');
  if (!data.postalCode?.trim()) missingFields.push('postalCode');
  if (!data.address?.trim()) missingFields.push('address');
  if (!data.district?.trim()) missingFields.push('district');
  if (!data.province?.trim()) missingFields.push('province');
  if (!data.region?.trim()) missingFields.push('region');

  if (missingFields.length > 0) {
    throw new Error(`Los campos ${missingFields.join(', ')} son requeridos`);
  }

  if (!userId?.trim()) {
    throw new Error('ID de usuario inválido');
  }

  // Validate document type
  const validDocumentTypes: DocumentType[] = [
    'DNI',
    'FOREIGNER_CARD',
    'PASSPORT',
  ];
  const documentType = data.documentType as DocumentType;

  if (!validDocumentTypes.includes(documentType)) {
    throw new Error(`Tipo de documento inválido: ${data.documentType}`);
  }

  // Process and validate fields
  const documentNumber = data.documentNumber!.trim();
  let phoneNumber = data.phoneNumber!.trim();
  const postalCode = data.postalCode!.trim();

  // Normalize phone number (add Peru country code if needed)
  if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('51')) {
    if (phoneNumber.startsWith('9')) {
      phoneNumber = '+51' + phoneNumber;
    }
  }
  phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

  // Validate field lengths
  if (documentNumber.length < 8) {
    throw new Error('El número de documento debe tener al menos 8 caracteres');
  }

  if (phoneNumber.startsWith('+51')) {
    if (phoneNumber.length < 12) {
      throw new Error(
        'El número de teléfono debe tener al menos 9 dígitos después del código de país',
      );
    }
  } else if (phoneNumber.length < 9) {
    throw new Error('El número de teléfono debe tener al menos 9 dígitos');
  }

  if (postalCode.length < 5) {
    throw new Error('El código postal debe tener al menos 5 caracteres');
  }

  // Process optional fields
  let gender: Gender | undefined = undefined;
  if (data.gender?.trim()) {
    const validGenders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
    gender = data.gender as Gender;
    if (!validGenders.includes(gender)) {
      throw new Error(`Género inválido: ${data.gender}`);
    }
  }

  let birthDate: string | undefined = undefined;
  if (data.birthDate?.trim()) {
    const date = new Date(data.birthDate);
    if (isNaN(date.getTime())) {
      throw new Error('Fecha de nacimiento inválida');
    }
    birthDate = date.toISOString();
  }

  return {
    document_type: documentType,
    document_number: documentNumber,
    phone_number: phoneNumber,
    postal_code: postalCode,
    address: data.address!.trim(),
    updated_by: userId.trim(),
    district: data.district!.trim(),
    province: data.province!.trim(),
    region: data.region!.trim(),
    birth_date: birthDate,
    gender: gender,
  };
}
