import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type VolumeUnit = 'metric' | 'imperial';
export type PressureUnit = 'mpa' | 'psi';

export interface UnitPreferences {
  temperature: TemperatureUnit;
  volume: VolumeUnit;
  pressure: PressureUnit;
}

export interface UnitPreferencesContextType {
  preferences: UnitPreferences;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setVolumeUnit: (unit: VolumeUnit) => void;
  setPressureUnit: (unit: PressureUnit) => void;
  toggleTemperatureUnit: () => void;
  toggleVolumeUnit: () => void;
  togglePressureUnit: () => void;
  formatTemp: (celsius: number, includeUnit?: boolean) => string;
  formatVolume: (m3: number, includeUnit?: boolean) => string;
  formatPressure: (mpa: number, includeUnit?: boolean) => string;
}

const DEFAULT_PREFERENCES: UnitPreferences = {
  temperature: 'celsius',
  volume: 'metric',
  pressure: 'mpa',
};

const UnitPreferencesContext = createContext<UnitPreferencesContextType | undefined>(undefined);

export const UnitPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UnitPreferences>(() => {
    try {
      const saved = localStorage.getItem('baghewala_unit_prefs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const savePrefs = useCallback((next: UnitPreferences) => {
    setPreferences(next);
    try {
      localStorage.setItem('baghewala_unit_prefs', JSON.stringify(next));
    } catch {
      // fallback
    }
  }, []);

  const setTemperatureUnit = useCallback((temperature: TemperatureUnit) => {
    savePrefs({ ...preferences, temperature });
  }, [preferences, savePrefs]);

  const setVolumeUnit = useCallback((volume: VolumeUnit) => {
    savePrefs({ ...preferences, volume });
  }, [preferences, savePrefs]);

  const setPressureUnit = useCallback((pressure: PressureUnit) => {
    savePrefs({ ...preferences, pressure });
  }, [preferences, savePrefs]);

  const toggleTemperatureUnit = useCallback(() => {
    setTemperatureUnit(preferences.temperature === 'celsius' ? 'fahrenheit' : 'celsius');
  }, [preferences.temperature, setTemperatureUnit]);

  const toggleVolumeUnit = useCallback(() => {
    setVolumeUnit(preferences.volume === 'metric' ? 'imperial' : 'metric');
  }, [preferences.volume, setVolumeUnit]);

  const togglePressureUnit = useCallback(() => {
    setPressureUnit(preferences.pressure === 'mpa' ? 'psi' : 'mpa');
  }, [preferences.pressure, setPressureUnit]);

  const formatTemp = useCallback((celsius: number, includeUnit = true): string => {
    if (preferences.temperature === 'fahrenheit') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return includeUnit ? `${f} °F` : `${f}`;
    }
    return includeUnit ? `${celsius} °C` : `${celsius}`;
  }, [preferences.temperature]);

  const formatVolume = useCallback((m3: number, includeUnit = true): string => {
    if (preferences.volume === 'imperial') {
      const bbl = Math.round(m3 * 6.2898);
      return includeUnit ? `${bbl.toLocaleString()} bbl` : `${bbl.toLocaleString()}`;
    }
    return includeUnit ? `${m3.toLocaleString()} m³` : `${m3.toLocaleString()}`;
  }, [preferences.volume]);

  const formatPressure = useCallback((mpa: number, includeUnit = true): string => {
    if (preferences.pressure === 'psi') {
      const psi = Math.round(mpa * 145.038);
      return includeUnit ? `${psi.toLocaleString()} psi` : `${psi.toLocaleString()}`;
    }
    return includeUnit ? `${mpa.toFixed(1)} MPa` : `${mpa.toFixed(1)}`;
  }, [preferences.pressure]);

  return (
    <UnitPreferencesContext.Provider
      value={{
        preferences,
        setTemperatureUnit,
        setVolumeUnit,
        setPressureUnit,
        toggleTemperatureUnit,
        toggleVolumeUnit,
        togglePressureUnit,
        formatTemp,
        formatVolume,
        formatPressure,
      }}
    >
      {children}
    </UnitPreferencesContext.Provider>
  );
};

export const useUnitPreferences = (): UnitPreferencesContextType => {
  const context = useContext(UnitPreferencesContext);
  if (!context) {
    throw new Error('useUnitPreferences must be used within a UnitPreferencesProvider');
  }
  return context;
};

export default UnitPreferencesContext;
