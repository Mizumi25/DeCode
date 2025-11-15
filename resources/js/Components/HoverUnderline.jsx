// @/Components/HoverUnderline.jsx
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export default function HoverUnderline({ children }) {
  const lineRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Hide line initially
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });
  }, []);

  const onEnter = () => {
    gsap.to(lineRef.current, {
      scaleX: 1,
      duration: 0.35,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    gsap.to(lineRef.current, {
      scaleX: 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="relative flex flex-col"
    >
      {children}

      {/* Underline */}
      <span
        ref={lineRef}
        className="absolute -bottom-1 left-0 h-[2px] w-full bg-[var(--color-primary)] rounded-full"
      />
    </div>
  );
}
