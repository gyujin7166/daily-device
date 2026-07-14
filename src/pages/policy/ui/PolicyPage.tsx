import type { PolicySection } from '../model/policies';

type PolicyPageProps = {
  title: string;
  description: string;
  updatedAt: string;
  sections: PolicySection[];
};

export default function PolicyPage({
  title,
  description,
  updatedAt,
  sections,
}: PolicyPageProps) {
  return (
    <section className="bg-canvas px-4 pb-20 pt-34 text-ink sm:px-6 lg:px-8 dark:bg-dark-bg dark:text-surface">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-line pb-8 dark:border-dark-border">
          <p className="text-sm font-medium text-primary">{updatedAt}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted dark:text-dark-muted">
            {description}
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-muted dark:text-dark-muted">
                {section.items.map((item) => (
                  <li key={item} className="pl-4 before:mr-3 before:content-['-']">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
