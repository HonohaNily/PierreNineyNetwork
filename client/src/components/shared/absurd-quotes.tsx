import { useEffect, useState } from "react";
import { useNineyMode } from "@/hooks/use-niney-mode";
import { getRandomQuote } from "@/lib/utils";

interface AbsurdQuoteProps {
  originalText: string;
  className?: string;
}

export function AbsurdQuote({ originalText, className }: AbsurdQuoteProps) {
  const { nineyMode } = useNineyMode();
  const [displayedText, setDisplayedText] = useState(originalText);
  
  useEffect(() => {
    if (nineyMode) {
      setDisplayedText(getRandomQuote());
    } else {
      setDisplayedText(originalText);
    }
  }, [nineyMode, originalText]);
  
  return (
    <p className={className}>
      <span className="font-display text-[var(--niney-purple)]">Pierre Niney a dit...</span> {displayedText}
    </p>
  );
}
