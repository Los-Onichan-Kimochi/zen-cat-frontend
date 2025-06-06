import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

type Props = {
  label?: string;
  nextRoute?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

function ContinueButton({
  label = 'Continuar',
  nextRoute,
  variant = 'default',
  size = 'lg',
}: Props) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => nextRoute && navigate({ to: nextRoute })}
      variant={variant}
      size={size}
    >
      {label}
    </Button>
  );
}

export { ContinueButton };
