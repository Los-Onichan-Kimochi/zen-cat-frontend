import { useNavigate } from '@tanstack/react-router';
import { useReservation } from '@/context/reservation-context';

export const useReservationFlow = () => {
  const navigate = useNavigate();
  const { reservationData, updateReservation, resetReservation } =
    useReservation();

  const navigateToService = (servicio?: string) => {
    navigate({
      to: '/reserva/servicios',
      search: servicio ? { servicio } : undefined,
    });
  };

  const navigateToLocation = (servicio?: string) => {
    if (!reservationData.service) {
      navigateToService(servicio);
      return;
    }
    navigate({
      to: '/reserva/location-professional',
      search: servicio ? { servicio } : undefined,
    });
  };

  const navigateToSchedule = (servicio?: string) => {
    if (!reservationData.service || !reservationData.location) {
      if (!reservationData.service) {
        navigateToService(servicio);
      } else {
        navigateToLocation(servicio);
      }
      return;
    }
    navigate({
      to: '/reserva/horario',
      search: servicio ? { servicio } : undefined,
    });
  };

  const navigateToConfirmation = (servicio?: string) => {
    if (
      !reservationData.service ||
      !reservationData.location ||
      !reservationData.date ||
      !reservationData.time
    ) {
      // Redirigir al paso correspondiente que falta
      if (!reservationData.service) {
        navigateToService(servicio);
      } else if (!reservationData.location) {
        navigateToLocation(servicio);
      } else {
        navigateToSchedule(servicio);
      }
      return;
    }
    navigate({
      to: '/reserva/confirmacion',
      search: servicio ? { servicio } : undefined,
    });
  };

  const canProceedToLocation = () => {
    return !!reservationData.service;
  };

  const canProceedToSchedule = () => {
    return !!reservationData.service && !!reservationData.location;
  };

  const canProceedToConfirmation = () => {
    return (
      !!reservationData.service &&
      !!reservationData.location &&
      !!reservationData.date &&
      !!reservationData.time
    );
  };

  const getReservationProgress = () => {
    let progress = 0;
    if (reservationData.service) progress += 25;
    if (reservationData.location) progress += 25;
    if (reservationData.date && reservationData.time) progress += 25;
    return progress;
  };

  return {
    reservationData,
    updateReservation,
    resetReservation,
    navigateToService,
    navigateToLocation,
    navigateToSchedule,
    navigateToConfirmation,
    canProceedToLocation,
    canProceedToSchedule,
    canProceedToConfirmation,
    getReservationProgress,
  };
};
