interface SelectableCardProps {
  title: string;
  description: string;
  imageUrl: string;
  selected: boolean;
  onClick: () => void;
  is_virtual?: boolean;
}

function SelectableCard({
  title,
  description,
  imageUrl,
  selected,
  onClick,
  is_virtual = false,
}: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
        selected ? 'border-black ring-2 ring-black' : 'border-gray-200'
      }`}
    >
      <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{title}</h4>
          <div className={`
            flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${is_virtual 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
            }
          `}>
            {is_virtual ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Virtual
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Presencial
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export { SelectableCard };
