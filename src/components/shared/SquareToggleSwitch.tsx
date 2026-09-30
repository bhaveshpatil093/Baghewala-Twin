import React from 'react';

interface SquareToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  colorScheme?: 'orange' | 'green';
}

export const SquareToggleSwitch: React.FC<SquareToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  colorScheme = 'orange',
}) => {
  const activeColor = colorScheme === 'green' ? 'bg-[#3A5F45]' : 'bg-[#C8551D]';
  const activeBorder = colorScheme === 'green' ? 'border-[#3A5F45]' : 'border-[#C8551D]';
  const activeThumb = colorScheme === 'green' ? 'bg-[#4E9B68]' : 'bg-[#C8551D]';
  const activeText = colorScheme === 'green' ? 'text-[#4E9B68]' : 'text-[#C8551D]';

  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[#252B30] last:border-b-0">
      <div className="flex-1 space-y-0.5">
        {label && (
          <label 
            htmlFor={id} 
            className="block font-mono text-xs font-bold text-[#E8E6E1] uppercase tracking-wide cursor-pointer"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="font-sans text-[11px] text-[#8A8F94] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Strict Squared Sliding Toggle */}
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <button
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative w-12 h-6 border transition-colors duration-100 ease-linear cursor-pointer focus:outline-none flex items-center p-0.5 select-none ${
            disabled ? 'opacity-40 cursor-not-allowed' : ''
          } ${
            checked 
              ? `${activeBorder} bg-[#14171A]` 
              : 'border-[#2E343A] bg-[#14171A] hover:border-[#3E454D]'
          }`}
          style={{ borderRadius: 0 }}
        >
          {/* Track fill indicator */}
          <div 
            className={`absolute inset-0 transition-opacity duration-100 ease-linear pointer-events-none ${
              checked ? 'bg-[#C8551D]/15 opacity-100' : 'opacity-0'
            }`} 
          />

          {/* Strictly Squared Sliding Thumb */}
          <span
            className={`w-4.5 h-4.5 block shadow-sm transform transition-transform duration-100 ease-linear ${
              checked 
                ? `translate-x-5.5 ${activeThumb}` 
                : 'translate-x-0 bg-[#5F656B]'
            }`}
            style={{ borderRadius: 0 }}
          />
        </button>

        {/* Monospace Indicator Badge [ON] / [OFF] */}
        <span 
          className={`font-mono text-[9px] font-bold uppercase w-8 tracking-wider ${
            checked ? activeText : 'text-[#5F656B]'
          }`}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
};

export default SquareToggleSwitch;
