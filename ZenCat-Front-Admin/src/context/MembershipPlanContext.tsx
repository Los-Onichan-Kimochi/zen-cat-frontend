'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MembershipPlan } from '@/types/membership-plan';

interface MembershipPlanContext {
  current?: MembershipPlan;
  setCurrent: (mp?: MembershipPlan) => void;
}

const MembershipPlanContext = createContext<MembershipPlanContext>({
  current: undefined,
  setCurrent: () => {},
});

export function MembershipPlanProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<MembershipPlan | undefined>(undefined);

  return (
    <MembershipPlanContext.Provider value={{ current, setCurrent }}>
      {children}
    </MembershipPlanContext.Provider>
  );
}
