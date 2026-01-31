import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHash?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel = 'Importar Dados',
  actionHash = 'import',
}: EmptyStateProps) => {
  const handleAction = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = actionHash;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Upload className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      <Button
        className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleAction}
      >
        <Upload className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
};
