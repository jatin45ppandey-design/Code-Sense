"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type DeveloperSignatureHandle = {
  updatePointer: (point: { x: number; y: number }) => void;
};

const OUTER_RADIUS = 180;
const INNER_RADIUS = 62;
const FULL_REVEAL_HOLD = 750;

export const DeveloperSignature = forwardRef<DeveloperSignatureHandle>(function DeveloperSignature(_, ref) {
  const zone = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const currentProgress = useRef(0);
  const targetProgress = useRef(0);
  const fullHoldUntil = useRef(0);
  const touchPointer = useRef(false);
  const [touchRevealed, setTouchRevealed] = useState(false);

  const writeProgress = useCallback((progress: number) => {
    const element = zone.current;
    if (!element) return;
    const clamped = Math.max(0, Math.min(1, progress));
    element.style.setProperty("--signature-reveal", clamped.toFixed(3));
    element.style.setProperty("--signature-blur", `${(8 * (1 - clamped)).toFixed(2)}px`);
    element.style.setProperty("--signature-offset", `${(4 * (1 - clamped)).toFixed(2)}px`);
    element.style.setProperty("--signature-tracking", `${(0.1 - (0.08 * clamped)).toFixed(3)}em`);
    const decodeIn = Math.max(0, Math.min(1, (clamped - 0.25) / 0.2));
    const decodeOut = Math.max(0, Math.min(1, (0.95 - clamped) / 0.25));
    const decodeIntensity = decodeIn * decodeOut;
    element.style.setProperty("--signature-glitch-opacity", `${(0.26 * decodeIntensity).toFixed(3)}`);
    element.style.setProperty("--signature-channel-offset", `${(2 * decodeIntensity).toFixed(2)}px`);
    element.style.setProperty("--signature-channel-offset-inverse", `${(-1.5 * decodeIntensity).toFixed(2)}px`);
    element.style.setProperty("--signature-slice-offset", `${(1.2 * decodeIntensity).toFixed(2)}px`);
    element.toggleAttribute("data-signature-decoding", decodeIntensity > 0.02);
    document.documentElement.style.setProperty("--signature-proximity", clamped.toFixed(3));
    document.documentElement.style.setProperty("--signature-cursor-growth", `${(4 * clamped).toFixed(2)}px`);
    document.documentElement.style.setProperty("--signature-orbit-duration", `${(8 + (3 * clamped)).toFixed(2)}s`);
    document.documentElement.style.setProperty("--signature-tick-opacity", `${(0.72 + (0.28 * clamped)).toFixed(3)}`);
  }, []);

  const settleProgress = useCallback(() => {
    const difference = targetProgress.current - currentProgress.current;
    currentProgress.current += difference * (difference < 0 ? 0.25 : 0.18);
    if (Math.abs(difference) < 0.003) currentProgress.current = targetProgress.current;
    writeProgress(currentProgress.current);
    if (currentProgress.current !== targetProgress.current) frame.current = window.requestAnimationFrame(settleProgress);
    else frame.current = null;
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
    const zoneElement = zone.current;
    const hideOnBlur = () => {
      fullHoldUntil.current = 0;
      document.documentElement.removeAttribute("data-signature-full");
      setTargetProgress(0);
    };
    const closeTouchReveal = (event: PointerEvent) => {
      if (zoneElement && !zoneElement.contains(event.target as Node)) setTouchRevealed(false);
    };

    window.addEventListener("blur", hideOnBlur);
    document.addEventListener("pointerdown", closeTouchReveal);
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      document.documentElement.style.removeProperty("--signature-proximity");
      document.documentElement.style.removeProperty("--signature-cursor-growth");
      document.documentElement.style.removeProperty("--signature-orbit-duration");
      document.documentElement.style.removeProperty("--signature-tick-opacity");
      document.documentElement.removeAttribute("data-signature-full");
      zoneElement?.removeAttribute("data-signature-decoding");
      window.removeEventListener("blur", hideOnBlur);
      document.removeEventListener("pointerdown", closeTouchReveal);
    };
  }, [setTargetProgress]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    touchPointer.current = event.pointerType === "touch";
  };

  return (
    <div ref={zone} data-signature-zone className={`codesense-developer-signature ${touchRevealed ? "is-touch-revealed" : ""}`}>
      <button type="button" tabIndex={-1} className="codesense-developer-signature-zone" aria-label="Reveal developer credit" onPointerDown={handlePointerDown} onClick={() => { if (touchPointer.current) setTouchRevealed((revealed) => !revealed); }}>
        <span className="codesense-developer-signature-copy" data-credit="Developed by Jatin Pandey"><span>Developed by</span><strong>Jatin Pandey</strong></span>
      </button>
    </div>
  );
});
