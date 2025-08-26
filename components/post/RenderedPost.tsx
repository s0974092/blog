
'use client';

interface RenderedPostProps {
  htmlContent: string;
}

/**
 * A lightweight client component that safely renders a string of HTML content.
 * It applies the `.prose` class to ensure consistent typography and styling.
 */
export function RenderedPost({ htmlContent }: RenderedPostProps) {
  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
