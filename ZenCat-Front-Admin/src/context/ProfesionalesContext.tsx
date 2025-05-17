'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Professional } from '@/types/professional';

interface ProfessionalContextValue {
    current?: Professional;
    setCurrent: (p?: Professional) => void;
}

const ProfessionalContext = createContext<ProfessionalContextValue>({
    current: undefined,
    setCurrent: () => { },
});

export function ProfessionalProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<Professional>();
    return (
        <ProfessionalContext.Provider value={{ current, setCurrent }}>
            {children}
        </ProfessionalContext.Provider>
    );
}

export function useProfessional() {
    return useContext(ProfessionalContext);
}
