import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentData } from '@/types/membership';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';

export function PaymentStep() {
  const { state, setPaymentData, nextStep, prevStep } = useMembershipOnboarding();
  
  const [formData, setFormData] = useState<PaymentData>(
    state.paymentData || {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: ''
    }
  );

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    let processedValue = value;
    
    // Formatear número de tarjeta
    if (field === 'cardNumber') {
      processedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (processedValue.length > 19) processedValue = processedValue.slice(0, 19);
    }
    
    // Formatear fecha de expiración
    if (field === 'expiryDate') {
      processedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
    }
    
    // Limitar CVV
    if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Fecha de expiración inválida (MM/AA)';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nombre del titular es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setPaymentData(formData);
      nextStep();
    }
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Información de Pago
          </CardTitle>
          <p className="text-center text-gray-600">
            Ingresa los datos de tu tarjeta para completar la suscripción
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen del plan */}
          {state.selectedPlan && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Resumen de tu plan</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{state.selectedPlan.name}</p>
                  <p className="text-sm text-gray-600">
                    Comunidad: {state.community?.name || 'Runners'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    S/ {state.selectedPlan.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{state.selectedPlan.duration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Datos de la tarjeta */}
          <div>
            <Label htmlFor="cardNumber">Número de tarjeta *</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="mt-1 pr-20"
              />
              {formData.cardNumber && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {getCardType(formData.cardNumber)}
                </span>
              )}
            </div>
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
          </div>

          {/* Fecha de expiración y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Fecha de expiración *</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/AA"
                className="mt-1"
              />
              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                className="mt-1"
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <Label htmlFor="cardholderName">Nombre del titular *</Label>
            <Input
              id="cardholderName"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              placeholder="Nombre completo como aparece en la tarjeta"
              className="mt-1"
            />
            {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
          </div>

          {/* Dirección de facturación */}
          <div>
            <Label htmlFor="billingAddress">Dirección de facturación</Label>
            <Input
              id="billingAddress"
              value={formData.billingAddress || ''}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              placeholder="Dirección de facturación (opcional)"
              className="mt-1"
            />
          </div>

          {/* Información de seguridad */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Tus datos están protegidos
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Utilizamos encriptación SSL de 256 bits para proteger tu información financiera.
                </p>
              </div>
            </div>
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
              Procesar Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 