type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm font-medium text-emerald-400">{eyebrow}</p>
        )}

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </section>
  );
}
