import { useEffect } from 'react';

interface SchemaMarkupProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
}

export function SchemaMarkup({ schema, id = 'schema-markup' }: SchemaMarkupProps) {
  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script tag
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, id]);

  return null;
}

// Convenience component for multiple schemas
interface MultiSchemaMarkupProps {
  schemas: Array<{ schema: Record<string, unknown>; id: string }>;
}

export function MultiSchemaMarkup({ schemas }: MultiSchemaMarkupProps) {
  return (
    <>
      {schemas.map(({ schema, id }) => (
        <SchemaMarkup key={id} schema={schema} id={id} />
      ))}
    </>
  );
}
