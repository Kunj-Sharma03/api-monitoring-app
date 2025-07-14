"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollReveal - Generic scroll reveal for dashboard sections (not just text)
 * Animates opacity, blur, and rotation as the element scrolls into view.
 *
 * Usage:
 * <ScrollReveal baseOpacity={0} enableBlur={true} baseRotation={5} blurStrength={10}>
 *   <YourComponentOrSection />
 * </ScrollReveal>
 */
const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  revealClassName = "",
  rotationEnd = "bottom bottom",
  animationEnd = "bottom bottom"
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    // Animate the container (opacity, blur, rotation)
    gsap.fromTo(
      el,
      {
        opacity: baseOpacity,
        scale: 0.98, // Removed blur and rotation for performance
        willChange: 'opacity, transform',
        transformOrigin: '0% 50%'
      },
      {
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        duration: 0.8, // Reduced duration for snappier animations
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 70%', // Adjusted start position for smoother experience
          end: animationEnd,
          scrub: 0.3, // Slightly reduced scrub for responsiveness
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, animationEnd, blurStrength]);

  return (
    <div ref={containerRef} className={`scroll-reveal-section ${containerClassName} ${revealClassName}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
