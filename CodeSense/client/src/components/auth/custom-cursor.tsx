"use client";

import { useEffect, useRef } from "react";

type PointerCoordinates = { x: number; y: number };

export function CustomCursor({ onPointerMove }: { onPointerMove?: (coordinates: PointerCoordinates) => void }) {
  const cursor = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLSpanElement>(null);
  const reactor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const capability = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let enabled = capability.matches;
    let frame: number | null = null;
    let target: PointerCoordinates | null = null;
    const setPosition = (element: HTMLElement | null, point: PointerCoordinates) => { element?.style.setProperty("--cursor-x", `${point.x}px`); element?.style.setProperty("--cursor-y", `${point.y}px`); };
    const setVisibility = (visible: boolean) => { core.current?.classList.toggle("is-visible", visible); reactor.current?.classList.toggle("is-visible", visible); };
    const setState = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const state = element?.closest("input, textarea, [contenteditable='true']") ? "text" : element?.closest("[data-signature-zone]") ? "signature" : element?.closest("[data-landing-cta]") ? "cta" : element?.closest("[data-product-preview]") ? "preview" : element?.closest("a, button, [role='button'], select, label") ? "interactive" : "default";
      reactor.current?.setAttribute("data-state", state);
      core.current?.setAttribute("data-state", state);
    };
    const tick = () => {
      if (target) setPosition(cursor.current, target);
      frame = null;
    };
    const handleMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      onPointerMove?.(point);
      if (!enabled) return;
      target = point;
      setVisibility(true);
      setState(event);
      if (frame === null) frame = window.requestAnimationFrame(tick);
    };
    const setPressed = (pressed: boolean) => { core.current?.classList.toggle("is-pressed", pressed); reactor.current?.classList.toggle("is-pressed", pressed); };
    const handlePointerDown = () => setPressed(true);
    const handlePointerUp = () => setPressed(false);
    const hide = () => setVisibility(false);
    const handleMouseOut = (event: MouseEvent) => { if (!event.relatedTarget) hide(); };
    const updateCapability = () => { enabled = capability.matches; document.body.classList.toggle("codesense-custom-cursor-active", enabled); if (!enabled) hide(); };

    updateCapability();
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("mouseout", handleMouseOut);
    capability.addEventListener("change", updateCapability);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      document.body.classList.remove("codesense-custom-cursor-active");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseout", handleMouseOut);
      capability.removeEventListener("change", updateCapability);
    };
  }, [onPointerMove]);

  return <div ref={cursor} className="codesense-custom-cursor" aria-hidden="true"><span ref={reactor} className="codesense-cursor-reactor" data-state="default"><svg viewBox="0 0 64 64"><path d="M32 3a29 29 0 0 1 18 7" /><path d="M57 20a29 29 0 0 1 4 13" /><path d="M56 45a29 29 0 0 1-13 12" /><path d="M32 61a29 29 0 0 1-18-7" /><path d="M7 44a29 29 0 0 1-4-13" /><path d="M8 19a29 29 0 0 1 10-11" /><path className="codesense-reactor-ticks" d="M32 0v5M64 32h-5M32 64v-5M0 32h5M10 10l4 4M54 10l-4 4" /></svg><span className="codesense-cursor-inner" /></span><span ref={core} className="codesense-cursor-core" /></div>;
}
