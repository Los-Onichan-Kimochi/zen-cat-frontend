import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMembershipOnboarding } from '@/context/MembershipOnboardingContext';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { onboardingService } from '@/api/onboarding';
import { membershipService } from '@/api/membership/membership';
import { OnboardingResponse } from '@/types/onboarding';
import { Membership, CreateMembershipRequest } from '@/types/membership';

export function ConfirmationStep() {
  const { state, resetOnboarding } = useMembershipOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResponse | null>(null);
  const [membershipResult, setMembershipResult] = useState<Membership | null>(null);
  const [currentProcess, setCurrentProcess] = useState<'onboarding' | 'membership' | 'completed'>('onboarding');
  const [hasStarted, setHasStarted] = useState(false); // Prevenir duplicación

  const handleSubmitOnboarding = async () => {
    // Prevenir múltiples llamadas
    if (hasStarted) {
      console.log('⚠️ Process already started, ignoring duplicate call');
      return;
    }
    
    setHasStarted(true);

    if (!user?.id || !state.onboardingData) {
      setError("No se pudieron obtener los datos del usuario o del formulario de onboarding.");
      setIsLoading(false);
      return;
    }

    // VALIDACIÓN TEMPRANA: Verificar que no sea un plan fallback
    if (state.selectedPlan?.id?.startsWith('fallback-')) {
      setError("Plan inválido detectado. El plan seleccionado no es válido para crear membresías. Por favor, selecciona un plan real del backend.");
      setIsLoading(false);
      setHasStarted(false);
      return;
    }

    // Validar formato UUID del plan
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!state.selectedPlan?.id || !uuidRegex.test(state.selectedPlan.id)) {
      setError(`Plan con ID inválido: ${state.selectedPlan?.id}. Solo se permiten planes con UUID válido del backend.`);
      setIsLoading(false);
      setHasStarted(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentProcess('onboarding');

    try {
      console.log('🚀 Step 1: Creating onboarding data...');
      console.log('👤 User ID:', user.id);
      console.log('📋 Onboarding Data:', state.onboardingData);
      console.log('✅ Plan validation passed - Plan ID:', state.selectedPlan.id);
      
      const onboardingResponse = await onboardingService.createOnboardingForUser(
        user.id,
        state.onboardingData
      );

      console.log('✅ Onboarding successful:', onboardingResponse);
      setOnboardingResult(onboardingResponse);

      // Paso 2: Crear la membresía
      setCurrentProcess('membership');
      await handleCreateMembership(onboardingResponse);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
      console.error('❌ Error in onboarding process:', errorMessage, err);
      setError(`Error al registrar tus datos: ${errorMessage}. Por favor, inténtalo de nuevo.`);
      setIsLoading(false);
      setHasStarted(false); // Permitir reintento
    }
  };

  const handleCreateMembership = async (onboardingResponse: OnboardingResponse) => {
    if (!user?.id || !state.selectedPlan || !state.community) {
      setError("No se pudieron obtener los datos necesarios para crear la membresía.");
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 Step 2: Creating membership...');
      console.log('📊 Available data:', {
        userId: user.id,
        community: state.community,
        selectedPlan: state.selectedPlan,
        onboardingResponse: onboardingResponse
      });

      // Validar que los IDs sean válidos
      if (!state.community.id || state.community.id.trim() === '') {
        throw new Error('ID de comunidad inválido');
      }

      if (!state.selectedPlan.id || state.selectedPlan.id.trim() === '') {
        throw new Error('ID de plan inválido');
      }

      // Validar formato UUID (8-4-4-4-12 caracteres)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(state.community.id)) {
        console.error('❌ Invalid community ID format:', state.community.id);
        throw new Error(`ID de comunidad tiene formato inválido: ${state.community.id}`);
      }

      if (!uuidRegex.test(state.selectedPlan.id)) {
        console.error('❌ Invalid plan ID format:', state.selectedPlan.id);
        throw new Error(`ID de plan tiene formato inválido: ${state.selectedPlan.id}`);
      }

      // Verificar si el plan es uno de los problemáticos conocidos
      const excludedIds = [
        '9f9ad18d-ba25-4f83-bfe0-7266e490c857', // 70 amount plan
        'c39b3250-e9e8-450a-a1f2-7faea528f3c2', // 1000 amount plan
      ];

      if (excludedIds.includes(state.selectedPlan.id)) {
        throw new Error(`Plan no disponible: ${state.selectedPlan.name}. Por favor seleccione otro plan.`);
      }
      
      // Calcular fechas de inicio y fin basándose en el tipo de plan
      const startDate = new Date();
      const endDate = new Date();
      
      if (state.selectedPlan.type === 'Mensual') {
        // Plan mensual: 30 días
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (state.selectedPlan.type === 'Anual') {
        // Plan anual: 365 días
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        // Fallback: 30 días por defecto
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      // Crear la request de membresía
      const membershipRequest: CreateMembershipRequest = {
        community_id: state.community.id,
        plan_id: state.selectedPlan.id,
        description: `Membresía ${state.selectedPlan.name} - ${state.selectedPlan.type} para ${state.community.name}`,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "ACTIVE",
      };

      console.log('📦 Membership request (COMPLETE):', JSON.stringify(membershipRequest, null, 2));
      console.log('🎯 Endpoint URL:', `/membership/user/${user.id}/`);
      console.log('🔍 Detailed validation:', {
        userId: user.id,
        userIdFormat: uuidRegex.test(user.id),
        planId: state.selectedPlan.id,
        planIdFormat: uuidRegex.test(state.selectedPlan.id),
        communityId: state.community.id,
        communityIdFormat: uuidRegex.test(state.community.id),
        startDateISO: startDate.toISOString(),
        endDateISO: endDate.toISOString(),
        status: "ACTIVE",
        planType: state.selectedPlan.type,
        planName: state.selectedPlan.name,
        communityName: state.community.name
      });
      
      // Verificar que las fechas sean válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Error al calcular las fechas de la membresía');
      }
      
      if (endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const membershipResponse = await membershipService.createMembershipForUser(
        user.id,
        membershipRequest
      );

      console.log('✅ Membership created successfully:', membershipResponse);
      setMembershipResult(membershipResponse);
      setCurrentProcess('completed');
      setIsLoading(false);

    } catch (err: any) {
      console.error('❌ Error creating membership:', err);
      console.error('📝 Error details:', {
        message: err.message,
        status: err.status,
        response: err.response,
        data: err.data,
        stack: err.stack
      });
      
      // Proporcionar mensaje de error más específico
      let errorMessage = 'Ocurrió un error desconocido';
      
      if (err.message?.includes('Plan no disponible')) {
        errorMessage = err.message;
      } else if (err.message?.includes('ID de')) {
        errorMessage = err.message + '. Por favor, inténtelo desde el inicio del proceso.';
      } else if (err.message?.includes('HTTP error! status: 400')) {
        errorMessage = 'Datos inválidos enviados al servidor. El plan seleccionado puede no estar disponible para esta comunidad.';
      } else if (err.message?.includes('HTTP error! status: 404')) {
        errorMessage = 'No se encontró el plan o la comunidad seleccionada. Es posible que hayan sido eliminados recientemente.';
      } else if (err.message?.includes('HTTP error! status: 409')) {
        errorMessage = 'Ya tienes una membresía activa para esta comunidad. No puedes tener membresías duplicadas.';
      } else if (err.message?.includes('HTTP error! status: 422')) {
        errorMessage = 'Los datos enviados no tienen el formato correcto. Es posible que falten campos requeridos o que los IDs no sean válidos.';
      } else if (err.message?.includes('HTTP error! status: 500')) {
        errorMessage = 'Error interno del servidor. Por favor, inténtelo más tarde.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`Error al crear la membresía: ${errorMessage}. Por favor, inténtalo de nuevo.`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSubmitOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleGoToCommunities = () => {
    resetOnboarding();
    navigate({ to: '/mis-comunidades' });
  };
  
  const handleDownloadReceipt = () => {
    console.log('Descargando comprobante...');
  };
  
  if (isLoading) {
    const processMessages = {
      onboarding: 'Registrando tus datos personales...',
      membership: 'Creando tu membresía...',
      completed: 'Finalizando...'
    };

    return (
      <div className="w-full max-w-lg mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold">Procesando tu membresía...</h2>
        <p className="text-gray-600">{processMessages[currentProcess]}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-12">
        <Card className="border-red-500 border-2">
            <CardHeader>
                <CardTitle className="text-red-600">¡Hubo un problema!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700 mb-4">{error}</p>
                <Button 
                  onClick={() => {
                    setHasStarted(false);
                    setError(null);
                    handleSubmitOnboarding();
                  }} 
                  className="bg-black text-white"
                >
                  Reintentar
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!onboardingResult || !membershipResult) {
    // Esto no debería pasar si no hay error, pero es un buen fallback.
    return (
        <div className="w-full max-w-lg mx-auto text-center py-12">
            <p>No se pudo mostrar la confirmación. Por favor, recarga la página.</p>
        </div>
    );
  }
  
  const startDate = membershipResult.start_date ? new Date(membershipResult.start_date).toLocaleDateString('es-PE') : 'N/A';
  const endDate = membershipResult.end_date ? new Date(membershipResult.end_date).toLocaleDateString('es-PE') : 'N/A';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-2 border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Compra realizada
          </CardTitle>
          <p className="text-gray-600">
            Tu membresía se ha activado correctamente
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {/* Tabla de detalles */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Comunidad</span>
                  <span>{membershipResult.community?.name || state.community?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Plan</span>
                  <span>
                    {state.selectedPlan?.name} - {state.selectedPlan?.type}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Estado</span>
                  <span className="text-green-600 font-semibold">{membershipResult.status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Cantidad de reservas</span>
                  <span>
                    {membershipResult.plan?.reservation_limit === 0 ? 'Ilimitadas' : membershipResult.plan?.reservation_limit || state.selectedPlan?.reservationLimit || 'Ilimitadas'}{' '}
                    reservas
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Fecha de inicio</span>
                  <span>{startDate}</span>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Nombre</span>
                  <span>{user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">DNI</span>
                  <span>
                    {onboardingResult.document_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">ID de membresía</span>
                  <span>{membershipResult.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-lg">Total</span>
                  <span className="font-bold text-lg">
                    S/ {membershipResult.plan?.fee?.toFixed(2) || state.selectedPlan?.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Fecha de fin</span>
                  <span>{endDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-black mb-2">
              ¡Bienvenido a {membershipResult.community?.name || state.community?.name || "la comunidad"}!
            </p>
            <p className="text-gray-600">
              Ya puedes empezar a disfrutar de todos los beneficios de tu
              membresía
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoToCommunities}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800"
            >
              Ir a mis comunidades
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="px-8 py-3"
            >
              Descargar comprobante
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
