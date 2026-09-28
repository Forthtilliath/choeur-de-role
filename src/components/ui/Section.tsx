export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <span aria-hidden="true" className="size-1.5 rotate-45 rounded-[1px] bg-secondary" />
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
