"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type DeveloperSignatureHandle = {
  updatePointer: (point: { x: number; y: number }) => void;
};

const OUTER_RADIUS = 180;
const INNER_RADIUS = 62;
const FULL_REVEAL_HOLD = 750;
const CREDIT_PREFIX = "Developed By";
const DEVELOPER_NAME = "Jatin Pandey";
const SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const SCRAMBLE_DURATION = 180;
const SCRAMBLE_STAGGER = 34;

function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [displayedText, setDisplayedText] = useState(text);
  const frame = useRef<number | null>(null);

  const cancelAnimation = useCallback(() => {
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const scramble = useCallback(() => {
    cancelAnimation();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedText(text);
      return;
    }

    const startedAt = performance.now();
    const update = (now: number) => {
      const elapsed = now - startedAt;
      setDisplayedText(text.split("").map((character, index) => {
        if (character === " " || elapsed >= index * SCRAMBLE_STAGGER + SCRAMBLE_DURATION) return character;
        return SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
      }).join(""));
      if (elapsed < text.length * SCRAMBLE_STAGGER + SCRAMBLE_DURATION) {
        frame.current = window.requestAnimationFrame(update);
      } else {
        frame.current = null;
        setDisplayedText(text);
      }
    };
    frame.current = window.requestAnimationFrame(update);
  }, [cancelAnimation, text]);

  useEffect(() => {
    if (active) {
      frame.current = window.requestAnimationFrame(scramble);
    } else {
      cancelAnimation();
      frame.current = window.requestAnimationFrame(() => setDisplayedText(text));
    }
    return cancelAnimation;
  }, [active, cancelAnimation, scramble, text]);

  useEffect(() => cancelAnimation, [cancelAnimation]);

  return (
    <span
      className={`codesense-developer-signature-name inline-block pointer-events-none ${active ? "is-visible" : ""}`}
      aria-hidden={!active}
    >
      {displayedText.split("").map((character, index) => (
        <span key={`${index}-${character}`} aria-hidden="true">{character === " " ? "\u00a0" : character}</span>
      ))}
    </span>
  );
}

export const DeveloperSignature = forwardRef<DeveloperSignatureHandle>(function DeveloperSignature(_, ref) {
  const zone = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const fullHoldUntil = useRef(0);
  const [signatureHovered, setSignatureHovered] = useState(false);

  const writeProgress = useCallback((progress: number) => {
    const element = zone.current;
    if (!element) return;
    const clamped = Math.max(0, Math.min(1, progress));
    element.style.setProperty("--signature-reveal", clamped.toFixed(3));
    element.style.setProperty("--signature-blur", `${(8 * (1 - clamped)).toFixed(2)}px`);
    element.style.setProperty("--signature-offset", `${(4 * (1 - clamped)).toFixed(2)}px`);
    element.style.setProperty("--signature-tracking", `${(0.1 - (0.08 * clamped)).toFixed(3)}em`);
    document.documentElement.style.setProperty("--signature-proximity", clamped.toFixed(3));
    document.documentElement.style.setProperty("--signature-cursor-growth", `${(4 * clamped).toFixed(2)}px`);
    document.documentElement.style.setProperty("--signature-orbit-duration", `${(8 + (3 * clamped)).toFixed(2)}s`);
    document.documentElement.style.setProperty("--signature-tick-opacity", `${(0.72 + (0.28 * clamped)).toFixed(3)}`);
  }, []);

  const settleProgress = useCallback(() => {
    function tick() {
      const difference = targetProgress.current - currentProgress.current;
      currentProgress.current += difference * (difference < 0 ? 0.25 : 0.18);
      if (Math.abs(difference) < 0.003) currentProgress.current = targetProgress.current;
      writeProgress(currentProgress.current);
      if (currentProgress.current !== targetProgress.current) frame.current = window.requestAnimationFrame(tick);
      else frame.current = null;
    }

    tick();
  }, [writeProgress]);

  const setTargetProgress = useCallback((progress: number) => {
    targetProgress.current = progress;
    if (frame.current === null) frame.current = window.requestAnimationFrame(settleProgress);
  }, [settleProgress]);

  useImperativeHandle(ref, () => ({
    updatePointer: ({ x, y }) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const bounds = zone.current?.getBoundingClientRect();
      if (!bounds) return;
      const distance = Math.hypot(x - (bounds.left + bounds.width / 2), y - (bounds.top + bounds.height / 2));
      const rawProgress = Math.max(0, Math.min(1, (OUTER_RADIUS - distance) / (OUTER_RADIUS - INNER_RADIUS)));
      const now = Date.now();
      if (distance <= INNER_RADIUS) fullHoldUntil.current = now + FULL_REVEAL_HOLD;
      const heldProgress = distance <= INNER_RADIUS + 18 && now < fullHoldUntil.current ? 1 : rawProgress;
      document.documentElement.toggleAttribute("data-signature-full", heldProgress === 1);
      setTargetProgress(heldProgress);
    },
  }), [setTargetProgress]);

  useEffect(() => {
    const hideOnBlur = () => {
      fullHoldUntil.current = 0;
      document.documentElement.removeAttribute("data-signature-full");
      setTargetProgress(0);
    };
    window.addEventListener("blur", hideOnBlur);
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      document.documentElement.style.removeProperty("--signature-proximity");
      document.documentElement.style.removeProperty("--signature-cursor-growth");
      document.documentElement.style.removeProperty("--signature-orbit-duration");
      document.documentElement.style.removeProperty("--signature-tick-opacity");
      document.documentElement.removeAttribute("data-signature-full");
      window.removeEventListener("blur", hideOnBlur);
    };
  }, [setTargetProgress]);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") return;
    setSignatureHovered(true);
  };

  const handlePointerLeave = () => {
    setSignatureHovered(false);
  };

  return (
    <div ref={zone} data-signature-zone className={`codesense-developer-signature ${signatureHovered ? "is-hovered" : ""}`}>
      <button type="button" tabIndex={-1} className="codesense-developer-signature-zone" aria-label={`${CREDIT_PREFIX} ${DEVELOPER_NAME}`} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave} onFocus={() => setSignatureHovered(true)} onBlur={() => setSignatureHovered(false)}>
        <span className="codesense-developer-signature-copy" aria-hidden="true">
          <span className="codesense-developer-signature-bracket codesense-developer-signature-bracket-left">&lt;</span>
          <span className="codesense-developer-signature-slash">/</span>
          <span className="codesense-developer-signature-bracket codesense-developer-signature-bracket-right">&gt;</span>
          <span className="codesense-developer-signature-copy-content"><span className="codesense-developer-signature-prefix">{CREDIT_PREFIX}</span><ScrambleText text={DEVELOPER_NAME} active={signatureHovered} /></span>
        </span>
      </button>
    </div>
  );
});
