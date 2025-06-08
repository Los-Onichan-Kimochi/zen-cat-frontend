import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed Select import - using native HTML select elements
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { OnboardingData } from '@/types/membership';

export function OnboardingStep() {
  const { state, setOnboardingData, nextStep, prevStep } = useMembershipOnboarding();
  
  const [formData, setFormData] = useState<OnboardingData>(
    state.onboardingData || {}
  );

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    setOnboardingData(formData);
    nextStep();
  };

  const isFormValid = formData.documentType && formData.documentNumber && 
                     formData.phoneNumber && formData.birthDate && 
                     formData.gender && formData.city;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <select
                id="documentType"
                value={formData.documentType || ''}
                onChange={(e) => handleInputChange('documentType', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar tipo</option>
                <option value="DNI">DNI</option>
                <option value="FOREIGNER_CARD">Carnet de Extranjería</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber || ''}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                placeholder="Ingrese número de documento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Ingrese número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <select
                id="gender"
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar género</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Ingrese ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ''}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Ingrese código postal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input
                id="district"
                value={formData.district || ''}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="Ingrese distrito"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ingrese dirección completa"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={prevStep}
              variant="outline"
              className="px-8"
            >
              Atrás
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isFormValid}
              className="px-8 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 