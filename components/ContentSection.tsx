interface ContentSectionProps {
  title: string;
  text: string;
  features?: string[];
  alternate?: boolean;
  id?: string;
}

export function ContentSection({title, text, features, alternate = false, id}: ContentSectionProps) {
  return (
    <section id={id} className={`py-16 px-6 ${alternate ? 'bg-section-alt' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">{text}</p>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
