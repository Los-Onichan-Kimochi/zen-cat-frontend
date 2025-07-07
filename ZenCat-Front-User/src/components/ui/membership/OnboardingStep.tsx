import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import {
  CreateOnboardingRequest,
  DocumentType,
  Gender,
} from '@/types/onboarding';
import { useAuth } from '@/context/AuthContext';
import { useUserOnboarding } from '@/hooks/use-user-onboarding';
import rawRegiones from '@/types/ubigeo_peru_2016_departamentos.json';
import rawProvincias from '@/types/ubigeo_peru_2016_provincias.json';
import rawDistritos from '@/types/ubigeo_peru_2016_distritos.json';
import { Region, Provincia, Distrito } from '@/types/local';

const regiones: Region[] = rawRegiones;
const provincias: Provincia[] = rawProvincias;
const distritos: Distrito[] = rawDistritos;

interface OnboardingFormData {
  // Required fields
  document_type: DocumentType | '';
  document_number: string;
  phone_number: string;
  postal_code: string;
  address: string;
  district: string;
  province: string;
  region: string;

  // Optional fields
  birth_date: string;
  gender: Gender | '';
}

interface FormErrors {
  document_type: string;
  document_number: string;
  phone_number: string;
  postal_code: string;
  address: string;
  district: string;
  province: string;
  region: string;
  birth_date: string;
}

export function OnboardingStep() {
  const { state, setOnboardingData, nextStep, prevStep } =
    useMembershipOnboarding();
  const { user } = useAuth();
  const {
    onboardingData,
    isLoading: onboardingLoading,
    error: onboardingError,
  } = useUserOnboarding();

  // Estado inicial del formulario
  const initialFormData: OnboardingFormData = {
    document_type: '',
    document_number: '',
    phone_number: '',
    postal_code: '',
    address: '',
    district: '',
    province: '',
    region: '',
    birth_date: '',
    gender: '',
  };

  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({
    document_type: '',
    document_number: '',
    phone_number: '',
    postal_code: '',
    address: '',
    district: '',
    province: '',
    region: '',
    birth_date: '',
  });

  // Efecto para cargar datos del usuario cuando estén disponibles
  useEffect(() => {
    if (onboardingData && user?.id) {
      // Convert OnboardingResponse to CreateOnboardingRequest
      const requestData: CreateOnboardingRequest = {
        document_type: onboardingData.document_type,
        document_number: onboardingData.document_number,
        phone_number: onboardingData.phone_number,
        postal_code: onboardingData.postal_code,
        address: onboardingData.address,
        district: onboardingData.district,
        province: onboardingData.province,
        region: onboardingData.region,
        updated_by: user.id,
        birth_date: onboardingData.birth_date || undefined,
        gender: onboardingData.gender || undefined,
      };

      // Set the data in the global context
      setOnboardingData(requestData);

      // Try to match by ID first, then by name (case-insensitive)
      let regionId = onboardingData.region || '';
      if (!regiones.find((r) => r.id === regionId)) {
        const regionByName = regiones.find(
          (r) =>
            r.name.toLowerCase() ===
            (onboardingData.region || '').toLowerCase(),
        );
        regionId = regionByName?.id || '';
      }

      // Province mapping
      let provinceId = onboardingData.province || '';
      if (!provincias.find((p) => p.id === provinceId)) {
        const provinceByName = provincias.find(
          (p) =>
            p.name.toLowerCase() ===
              (onboardingData.province || '').toLowerCase() &&
            p.department_id === regionId,
        );
        provinceId = provinceByName?.id || '';
      }

      // District mapping
      let districtId = onboardingData.district || '';
      if (!distritos.find((d) => d.id === districtId)) {
        const districtByName = distritos.find(
          (d) =>
            d.name.toLowerCase() ===
              (onboardingData.district || '').toLowerCase() &&
            d.department_id === regionId &&
            d.province_id === provinceId,
        );
        districtId = districtByName?.id || '';
      }

      // Format birth_date to YYYY-MM-DD for the date input
      const formattedBirthDate = onboardingData.birth_date
        ? onboardingData.birth_date.split('T')[0]
        : '';

      const normalizedDocumentType = (
        onboardingData.document_type || ''
      ).toUpperCase();
      const normalizedGender = (onboardingData.gender || '').toUpperCase();

      setFormData({
        document_type: normalizedDocumentType as DocumentType | '',
        document_number: onboardingData.document_number || '',
        phone_number: onboardingData.phone_number || '',
        postal_code: onboardingData.postal_code || '',
        address: onboardingData.address || '',
        district: districtId,
        province: provinceId,
        region: regionId,
        birth_date: formattedBirthDate,
        gender: normalizedGender as Gender | '',
      });
    }
  }, [onboardingData, setOnboardingData, user?.id]);

  // Mostrar resumen en modo solo-lectura si ya existe onboarding
  if (!onboardingLoading && onboardingData) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Datos ya registrados
            </CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Ya contamos con tu información de identificación, verifica que sea
              correcta y continúa
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p>
                <strong>Tipo de Documento:</strong>{' '}
                {onboardingData.document_type}
              </p>
              <p>
                <strong>Número de Documento:</strong>{' '}
                {onboardingData.document_number}
              </p>
              <p>
                <strong>Teléfono:</strong> {onboardingData.phone_number}
              </p>
              <p>
                <strong>Código Postal:</strong> {onboardingData.postal_code}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong>{' '}
                {onboardingData.birth_date?.split('T')[0]}
              </p>
              <p>
                <strong>Género:</strong> {onboardingData.gender}
              </p>
              <p>
                <strong>Región:</strong> {onboardingData.region}
              </p>
              <p>
                <strong>Provincia:</strong> {onboardingData.province}
              </p>
              <p>
                <strong>Distrito:</strong> {onboardingData.district}
              </p>
              <p className="md:col-span-2">
                <strong>Dirección:</strong> {onboardingData.address}
              </p>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={nextStep}
                className="px-8 bg-black text-white hover:bg-gray-800"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (onboardingLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error si ocurrió alguno
  if (onboardingError) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-red-500 border-2">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error al cargar los datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{onboardingError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-black text-white"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cálculos para los dropdowns de ubigeo
  const selectedRegion = regiones.find(
    (region) => region.id === formData.region,
  );
  const selectedProvincia = provincias.find(
    (prov) => prov.id === formData.province,
  );

  const provinciasFiltradas = provincias.filter(
    (prov) => prov.department_id === selectedRegion?.id,
  );

  const distritosFiltrados = distritos.filter(
    (dist) =>
      dist.department_id === selectedRegion?.id &&
      dist.province_id === selectedProvincia?.id,
  );

  // Validaciones robustas
  const validate = () => {
    let valid = true;
    const newErrors: FormErrors = {
      document_type: '',
      document_number: '',
      phone_number: '',
      postal_code: '',
      address: '',
      district: '',
      province: '',
      region: '',
      birth_date: '',
    };

    // Validar tipo de documento
    if (!formData.document_type) {
      newErrors.document_type = 'Seleccione un tipo de documento';
      valid = false;
    }

    // Validar número de documento
    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El número de documento es requerido';
      valid = false;
    } else {
      // Validar formato según tipo
      if (
        formData.document_type === 'DNI' &&
        !formData.document_number.match(/^\d{8}$/)
      ) {
        newErrors.document_number = 'El DNI debe tener 8 dígitos';
        valid = false;
      } else if (
        formData.document_type === 'FOREIGNER_CARD' &&
        !formData.document_number.match(/^\d{9}$/)
      ) {
        newErrors.document_number =
          'El Carnet de Extranjería debe tener 9 dígitos';
        valid = false;
      } else if (
        formData.document_type === 'PASSPORT' &&
        !formData.document_number.match(/^[A-Za-z0-9]{6,12}$/)
      ) {
        newErrors.document_number =
          'El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos';
        valid = false;
      }
    }

    // Validar teléfono (solo números y longitud 9-15)
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'El número de teléfono es requerido';
      valid = false;
    } else if (!formData.phone_number.match(/^\d{9,15}$/)) {
      newErrors.phone_number =
        'Ingrese un número de teléfono válido (9-15 dígitos)';
      valid = false;
    }

    // Validar código postal
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido';
      valid = false;
    } else if (!formData.postal_code.match(/^\d{5}$/)) {
      newErrors.postal_code = 'El código postal debe tener 5 dígitos.';
      valid = false;
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
      valid = false;
    }

    // Validar región
    if (!formData.region.trim()) {
      newErrors.region = 'Seleccione una región';
      valid = false;
    } else {
      // Verify the region ID exists
      const regionExists = regiones.find((r) => r.id === formData.region);
      if (!regionExists) {
        newErrors.region = 'Región seleccionada no válida';
        valid = false;
      }
    }

    // Validar provincia
    if (!formData.province.trim()) {
      newErrors.province = 'Seleccione una provincia';
      valid = false;
    } else {
      // Verify the province ID exists and belongs to the selected region
      const provinceExists = provincias.find(
        (p) =>
          p.id === formData.province && p.department_id === formData.region,
      );
      if (!provinceExists) {
        newErrors.province = 'Provincia seleccionada no válida';
        valid = false;
      }
    }

    // Validar distrito
    if (!formData.district.trim()) {
      newErrors.district = 'Seleccione un distrito';
      valid = false;
    } else {
      // Verify the district ID exists and belongs to the selected province and region
      const districtExists = distritos.find(
        (d) =>
          d.id === formData.district &&
          d.department_id === formData.region &&
          d.province_id === formData.province,
      );
      if (!districtExists) {
        newErrors.district = 'Distrito seleccionado no válido';
        valid = false;
      }
    }

    // Validación de fecha de nacimiento (si se proporciona)
    if (formData.birth_date.trim()) {
      const birthDate = new Date(formData.birth_date);
      const currentDate = new Date();
      const minDate = new Date('1900-01-01');

      if (isNaN(birthDate.getTime())) {
        newErrors.birth_date = 'Ingrese una fecha válida';
        valid = false;
      } else if (birthDate > currentDate) {
        newErrors.birth_date = 'La fecha no puede ser mayor a la fecha actual';
        valid = false;
      } else if (birthDate < minDate) {
        newErrors.birth_date = 'La fecha no puede ser anterior al año 1900';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (
    field: keyof OnboardingFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handlers específicos para los dropdowns de ubigeo
  const handleRegionChange = (value: string) => {
    setFormData({
      ...formData,
      region: value,
      province: '', // Reset provincia cuando cambia región
      district: '', // Reset distrito cuando cambia región
    });
    // Limpiar errores relacionados
    setErrors((prev) => ({
      ...prev,
      region: '',
      province: '',
      district: '',
    }));
  };

  const handleProvinciaChange = (value: string) => {
    setFormData({
      ...formData,
      province: value,
      district: '', // Reset distrito cuando cambia provincia
    });
    // Limpiar errores relacionados
    setErrors((prev) => ({
      ...prev,
      province: '',
      district: '',
    }));
  };

  const handleDistritoChange = (value: string) => {
    setFormData({ ...formData, district: value });
    // Limpiar error
    setErrors((prev) => ({ ...prev, district: '' }));
  };

  const handleContinue = () => {
    if (!validate()) return;

    // Find the actual names from the IDs for the API
    const selectedRegionName =
      regiones.find((r) => r.id === formData.region)?.name || '';
    const selectedProvinceName =
      provincias.find((p) => p.id === formData.province)?.name || '';
    const selectedDistrictName =
      distritos.find((d) => d.id === formData.district)?.name || '';

    // Convert to the correct format for the API
    const onboardingRequest: CreateOnboardingRequest = {
      // Required fields
      document_type: formData.document_type as DocumentType,
      document_number: formData.document_number,
      phone_number: formData.phone_number,
      postal_code: formData.postal_code,
      address: formData.address,
      updated_by: user?.id || '', // Use current user ID
      district: selectedDistrictName,
      province: selectedProvinceName,
      region: selectedRegionName,

      // Optional fields (only include if they have values)
      ...(formData.birth_date && {
        birth_date: new Date(formData.birth_date).toISOString(),
      }),
      ...(formData.gender &&
        formData.gender.length > 0 && { gender: formData.gender as Gender }),
    };

    setOnboardingData(onboardingRequest);
    nextStep();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Información Personal
          </CardTitle>
          <p className="text-center text-gray-600 text-sm">
            Complete sus datos personales para continuar con la membresía
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Información de Identificación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Tipo de Documento *</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) =>
                    handleInputChange('document_type', value)
                  }
                  placeholder="Seleccione un tipo de documento"
                >
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="FOREIGNER_CARD">
                    Carnet de Extranjería
                  </SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                </Select>
                {errors.document_type && (
                  <span className="text-red-500 text-sm">
                    {errors.document_type}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_number">Número de Documento *</Label>
                <Input
                  id="document_number"
                  value={formData.document_number}
                  onChange={(e) =>
                    handleInputChange('document_number', e.target.value)
                  }
                  placeholder="Ingrese número de documento"
                />
                {errors.document_number && (
                  <span className="text-red-500 text-sm">
                    {errors.document_number}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Teléfono *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    handleInputChange('phone_number', e.target.value)
                  }
                  placeholder="Ej: 987654321"
                />
                {errors.phone_number && (
                  <span className="text-red-500 text-sm">
                    {errors.phone_number}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    handleInputChange('birth_date', e.target.value)
                  }
                />
                {errors.birth_date && (
                  <span className="text-red-500 text-sm">
                    {errors.birth_date}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  placeholder="Seleccione género"
                >
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Femenino</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </Select>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Ubicación Geográfica *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Región *</Label>
                <Select
                  value={formData.region}
                  onValueChange={handleRegionChange}
                  placeholder="Seleccione una región"
                >
                  {regiones.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </Select>
                {errors.region && (
                  <span className="text-red-500 text-sm">{errors.region}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia *</Label>
                {formData.region ? (
                  <Select
                    value={formData.province}
                    onValueChange={handleProvinciaChange}
                    placeholder="Seleccione una provincia"
                  >
                    {provinciasFiltradas.map((prov) => (
                      <SelectItem key={prov.id} value={prov.id}>
                        {prov.name}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500">
                    Seleccione primero una región
                  </div>
                )}
                {errors.province && (
                  <span className="text-red-500 text-sm">
                    {errors.province}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Distrito *</Label>
                {formData.province ? (
                  <Select
                    value={formData.district}
                    onValueChange={handleDistritoChange}
                    placeholder="Seleccione un distrito"
                  >
                    {distritosFiltrados.map((dist) => (
                      <SelectItem key={dist.id} value={dist.id}>
                        {dist.name}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500">
                    Seleccione primero una provincia
                  </div>
                )}
                {errors.district && (
                  <span className="text-red-500 text-sm">
                    {errors.district}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    handleInputChange('postal_code', e.target.value)
                  }
                  placeholder="Ingrese código postal"
                />
                {errors.postal_code && (
                  <span className="text-red-500 text-sm">
                    {errors.postal_code}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Completa *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ej: Av. El Sol 123, Dpto 4B"
              />
              {errors.address && (
                <span className="text-red-500 text-sm">{errors.address}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} variant="outline" className="px-8">
              Atrás
            </Button>
            <Button
              onClick={handleContinue}
              className="px-8 bg-black text-white hover:bg-gray-800"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
