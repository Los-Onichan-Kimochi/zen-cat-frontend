import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';

export function OnboardingStep() {
  const { state, setOnboardingData, nextStep, prevStep } = useMembershipOnboarding();
  
  const [formData, setFormData] = useState<OnboardingData>(
    state.onboardingData || {
      documentType: undefined,
      documentNumber: '',
      phoneNumber: '',
      birthDate: '',
      gender: undefined,
      city: '',
      postalCode: '',
      district: '',
      address: ''
    }
  );

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.documentType) newErrors.documentType = 'Tipo de documento es requerido';
    if (!formData.documentNumber) newErrors.documentNumber = 'Número de documento es requerido';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Teléfono es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento es requerida';
    if (!formData.gender) newErrors.gender = 'Género es requerido';
    if (!formData.city) newErrors.city = 'Ciudad es requerida';
    if (!formData.district) newErrors.district = 'Distrito es requerido';
    if (!formData.address) newErrors.address = 'Dirección es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setOnboardingData(formData);
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Información Personal
          </CardTitle>
          <p className="text-center text-gray-600">
            Completa tus datos para continuar con tu membresía
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo y número de documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentType">Tipo de documento *</Label>
              <select
                id="documentType"
                value={formData.documentType || ''}
                onChange={(e) => handleInputChange('documentType', e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                <option value="DNI">DNI</option>
                <option value="FOREIGNER_CARD">Carné de extranjería</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
              {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>}
            </div>
            <div>
              <Label htmlFor="documentNumber">Número de documento *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber || ''}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                placeholder="Ej: 12345678"
                className="mt-1"
              />
              {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="phoneNumber">Número de teléfono *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Ej: 987654321"
              className="mt-1"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Fecha de nacimiento y género */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate">Fecha de nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="mt-1"
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
            <div>
              <Label htmlFor="gender">Género *</Label>
              <select
                id="gender"
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Seleccionar género</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Ciudad y código postal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Ej: Lima"
                className="mt-1"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="postalCode">Código postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ''}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Ej: 15001"
                className="mt-1"
              />
            </div>
          </div>

          {/* Distrito */}
          <div>
            <Label htmlFor="district">Distrito *</Label>
            <Input
              id="district"
              value={formData.district || ''}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="Ej: Miraflores"
              className="mt-1"
            />
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>

          {/* Dirección */}
          <div>
            <Label htmlFor="address">Dirección completa *</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ej: Av. Larco 123, Miraflores"
              className="mt-1"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={prevStep}
              variant="outline"
              className="px-6 py-2"
            >
              Retroceder
            </Button>
            <Button
              onClick={handleContinue}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 