
interface HighlightedTextProps {
  text: string;
  query?: string;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedText({ text, query = '' }: HighlightedTextProps) {
  if (!query) return <>{text}</>;

  const escaped = escapeRegExp(query);
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default HighlightedText;
