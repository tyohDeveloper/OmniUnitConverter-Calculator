import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { NumberFormat } from '@/lib/formatting';
import { useConverterState, type UseConverterStateReturn } from '../hooks/useConverterState';
import { useCalculatorState, type UseCalculatorStateReturn } from '../hooks/useCalculatorState';
import { useRpnStack, type UseRpnStackReturn } from '../hooks/useRpnStack';
import { useAllFlashFlags, type FlashFlags } from '../hooks/useFlashFlag';

export interface ConverterContextValue {
  // Converter state (from useConverterState hook)
  converter: UseConverterStateReturn;
  
  // Calculator state (from useCalculatorState hook)
  calculator: UseCalculatorStateReturn;
  
  // RPN stack (from useRpnStack hook)
  rpn: UseRpnStackReturn;
  
  // Flash flags (from useAllFlashFlags hook)
  flash: FlashFlags;
  
  // Tab state
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  
  // Number format state
  numberFormat: NumberFormat;
  setNumberFormat: React.Dispatch<React.SetStateAction<NumberFormat>>;
  
  // Language state
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  
  // Direct tab state
  directValue: string;
  setDirectValue: React.Dispatch<React.SetStateAction<string>>;
  directExponents: Record<string, number>;
  setDirectExponents: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const ConverterContext = createContext<ConverterContextValue | null>(null);

export function useConverterContext(): ConverterContextValue {
  const context = useContext(ConverterContext);
  if (!context) {
    throw new Error('useConverterContext must be used within a ConverterProvider');
  }
  return context;
}

interface ConverterProviderProps {
  children: ReactNode;
}

export function ConverterProvider({ children }: ConverterProviderProps) {
  // Use existing hooks for state management
  const converter = useConverterState();
  const calculator = useCalculatorState();
  const rpn = useRpnStack();
  const flash = useAllFlashFlags(300);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('converter');
  
  // Number format state
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('uk');
  
  // Language state
  const [language, setLanguage] = useState<string>('en');
  
  // Direct tab state
  const [directValue, setDirectValue] = useState<string>('1');
  const [directExponents, setDirectExponents] = useState<Record<string, number>>({
    m: 0,
    kg: 0,
    s: 0,
    A: 0,
    K: 0,
    mol: 0,
    cd: 0,
    rad: 0,
    sr: 0
  });
  
  const value: ConverterContextValue = {
    converter,
    calculator,
    rpn,
    flash,
    activeTab,
    setActiveTab,
    numberFormat,
    setNumberFormat,
    language,
    setLanguage,
    directValue,
    setDirectValue,
    directExponents,
    setDirectExponents,
  };
  
  return (
    <ConverterContext.Provider value={value}>
      {children}
    </ConverterContext.Provider>
  );
}

export { ConverterContext };
