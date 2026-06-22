"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

const REST_BY_LOCALE: Record<string, string[]> = {
  en: ["writing.", "coding.", "image creation.", "your workflow.", "every task."],
  ko: ["글쓰기.", "코딩.", "이미지 생성.", "당신의 워크플로우.", "모든 작업."],
};

export function HeroTypewriter({ fallback = "ever need." }: { fallback?: string } = {}) {
  const locale = useLocale();
  const REST = REST_BY_LOCALE[locale] ?? REST_BY_LOCALE.en;
  const PHRASES = [fallback, ...REST];
  const [text, setText] = useState(PHRASES[0]);
  const stateRef = useRef({ pi: 0, ci: PHRASES[0].length, deleting: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const phrase = PHRASES[s.pi];
      if (!s.deleting) {
        s.ci++;
        setText(phrase.slice(0, s.ci));
        if (s.ci === phrase.length) {
          s.deleting = true;
          timer = setTimeout(tick, 2200);
          return;
        }
      } else {
        s.ci--;
        setText(phrase.slice(0, s.ci));
        if (s.ci === 0) {
          s.deleting = false;
          s.pi = (s.pi + 1) % PHRASES.length;
        }
      }
      timer = setTimeout(tick, s.deleting ? 60 : 100);
    };
    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, []);

  return <span className="typewriter">{text}</span>;
}
