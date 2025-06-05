'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Local } from '@/types/local';

interface LocalContextValue {
    current?: Local;
    setCurrent: (p?: Local) => void;
}

const LocalContext = createContext<LocalContextValue>({
    current: undefined,
    setCurrent: () => { },
});

export function LocalProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<Local>();
    return (
        <LocalContext.Provider value={{ current, setCurrent }}>
            {children}
        </LocalContext.Provider>
    );
}

export function useLocal() {
    return useContext(LocalContext);
}
