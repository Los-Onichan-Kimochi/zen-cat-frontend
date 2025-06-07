interface SelectableCardProps {
  title: string;
  description: string;
  imageUrl: string;
  selected: boolean;
  onClick: () => void;
}

function SelectableCard({
  title,
  description,
  imageUrl,
  selected,
  onClick,
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
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export { SelectableCard };
