type SectionCardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-base font-semibold text-white">{title}</h2>
          )}

          {description && (
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
