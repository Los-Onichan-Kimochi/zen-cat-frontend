import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReservationLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  pavilion: string;
  capacity?: number;
  streetName?: string;
  buildingNumber?: string;
  province?: string;
  region?: string;
  reference?: string;
}

export interface ReservationTimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface ReservationSession {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  registeredCount: number;
  professionalId: string;
  localId?: string;
}

export interface ReservationData {
  service?: {
    id: string;
    name: string;
    description: string;
    image_url: string;
  };
  location?: ReservationLocation;
  session?: ReservationSession;
  date?: string;
  time?: string;
  instructor?: string;
  communityId?: string;
  userId?: string; // ID del usuario actual
}

interface ReservationContextType {
  reservationData: ReservationData;
  updateReservation: (data: Partial<ReservationData>) => void;
  resetReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({
  children,
}) => {
  const [reservationData, setReservationData] = useState<ReservationData>({
    communityId: 'c730f30e-f6ed-40e6-a210-48ec017c9234', // Valor por defecto de los datos dummy
    userId: 'test-user-id', // TODO: Obtener del auth context
  });

  const updateReservation = (data: Partial<ReservationData>) => {
    setReservationData((prev) => ({ ...prev, ...data }));
  };

  const resetReservation = () => {
    setReservationData({
      communityId: 'c730f30e-f6ed-40e6-a210-48ec017c9234',
      userId: 'test-user-id',
    });
  };

  return (
    <ReservationContext.Provider
      value={{ reservationData, updateReservation, resetReservation }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
