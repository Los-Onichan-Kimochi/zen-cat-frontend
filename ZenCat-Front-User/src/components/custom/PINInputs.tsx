import React from 'react';

interface PINInputsProps {
  length: number;
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => void;
}

const PINInputs: React.FC<PINInputsProps> = ({
  length,
  inputsRef,
  handleChange,
  handleKeyDown,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 mb-6 max-w-full">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          maxLength={1}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          ref={(el) => (inputsRef.current[i] = el)}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 sm:w-11 md:w-12 h-12 text-xl text-center border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      ))}
    </div>
  );
};

export default PINInputs;
