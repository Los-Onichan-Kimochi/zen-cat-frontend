type Props = {
  currentStep: number;
  steps: string[];
};

function ProgressBar({ currentStep, steps }: Props) {
  return (
    <div className="flex justify-center items-center gap-4 flex-wrap">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              i <= currentStep ? 'bg-black' : 'border border-black'
            }`}
          />
          <span className="text-sm whitespace-nowrap">{label}</span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-black" />}
        </div>
      ))}
    </div>
  );
}

export { ProgressBar };
