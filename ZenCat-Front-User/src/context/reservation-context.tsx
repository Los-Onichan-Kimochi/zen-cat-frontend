import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

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
    communityId: 'ade8c5e1-ab82-47e0-b48b-3f8f2324c450', // ZenCat Wellness Community (UUID fijo)
    userId: '11111111-1111-1111-1111-111111111111', // Usuario Demo (UUID fijo)
  });

  const updateReservation = useCallback((data: Partial<ReservationData>) => {
    setReservationData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetReservation = useCallback(() => {
    setReservationData({
      communityId: 'ade8c5e1-ab82-47e0-b48b-3f8f2324c450', // ZenCat Wellness Community (UUID fijo)
      userId: '11111111-1111-1111-1111-111111111111', // Usuario Demo (UUID fijo)
    });
  }, []);

  return (
    <ReservationContext.Provider
      value={{ reservationData, updateReservation, resetReservation }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
