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

export interface ReservationProfessional {
  id: string;
  name: string;
  first_last_name: string;
  second_last_name?: string;
  specialty: string;
  email: string;
  phone_number: string;
  type: string;
  image_url: string;
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
  sessionLink?: string;
}

export interface ReservationData {
  service?: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    is_virtual: boolean;
  };
  location?: ReservationLocation;
  professional?: ReservationProfessional;
  session?: ReservationSession;
  date?: string;
  time?: string;
  instructor?: string;
  communityId?: string;
  userId?: string; // ID del usuario actual
  membershipId?: string; // ID de la membresía asociada
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
    // Se puede inicializar vacío o con valores por defecto según se necesite
  });

  const updateReservation = useCallback((data: Partial<ReservationData>) => {
    setReservationData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetReservation = useCallback(() => {
    setReservationData({
      // Resetear a un estado vacío o con valores por defecto
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
