
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
        filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
        rotate: baseRotation,
        scale: 0.96,
        willChange: 'opacity, filter, transform',
        transformOrigin: '0% 50%'
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        rotate: 0,
        scale: 1,
        ease: 'power2.out',
        duration: 1.1,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 60%',
          end: animationEnd,
          scrub: 0.4,
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
