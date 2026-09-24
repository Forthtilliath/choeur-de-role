import { Button } from '@/components/ui/Button';

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
                active
                  ? 'bg-primary border-primary text-white'
                  : done
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-background-secondary border-border text-foreground/30'
              }`}
            >
              {done ? '✓' : step}
            </div>
            {step < total && <div className={`h-px w-8 ${done ? 'bg-primary/40' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export function StepHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">{eyebrow}</p>
      <h2 className="text-2xl font-medium text-foreground mb-2">{title}</h2>
      <p className="text-foreground/60 text-sm">{children}</p>
    </div>
  );
}

// « Passer cette étape » / « Continuer → »
export function StepNav({
  onNextAction,
  disabled,
}: {
  onNextAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button variant="link" onClick={onNextAction}>
        Passer cette étape
      </Button>
      <Button onClick={onNextAction} disabled={disabled}>
        Continuer →
      </Button>
    </div>
  );
}
