"use client";
import { useEffect, useRef, useState } from "react";

const PHRASES = ["ever need.", "writing.", "coding.", "image creation.", "your workflow.", "every task."];

export function HeroTypewriter() {
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
