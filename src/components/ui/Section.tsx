export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {title && <h2 className="text-base font-medium text-foreground">{title}</h2>}
      {children}
    </section>
  );
}
