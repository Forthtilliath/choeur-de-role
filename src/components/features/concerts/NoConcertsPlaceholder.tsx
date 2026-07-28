import { Button } from '@/components/ui/Button';

export function NoConcertsPlaceholder({
  message,
  buttonHref,
  buttonText,
}: {
  message: string;
  buttonHref: string;
  buttonText: string;
}) {
  return (
    <div className="text-center py-12 mb-10 md:mb-20 rounded-2xl bg-background-secondary">
      <p className="text-foreground/50 mb-4">{message}</p>
      <Button href={buttonHref} variant="outline">
        {buttonText}
      </Button>
    </div>
  );
}
