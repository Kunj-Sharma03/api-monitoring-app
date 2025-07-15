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
  const scrollTriggerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    // Clean up previous trigger for this specific element
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    // Animate the container (opacity, blur, rotation, scale)
    const tl = gsap.fromTo(
      el,
      {
        opacity: baseOpacity,
        scale: 0.85,
        rotationX: enableBlur ? baseRotation : 0,
        y: 30,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
        willChange: 'opacity, transform, filter',
        transformOrigin: '50% 50%'
      },
      {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        y: 0,
        filter: 'blur(0px)',
        ease: 'power2.out',
        duration: 1.2,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 80%',
          end: animationEnd || 'top 30%',
          scrub: 0.5,
          toggleActions: "play none none reverse",
          onEnter: () => console.log('ScrollReveal triggered for:', el.className),
          onUpdate: (self) => console.log('ScrollReveal progress:', self.progress)
        },
      }
    );

    // Store the scroll trigger reference
    scrollTriggerRef.current = ScrollTrigger.getById(tl.scrollTrigger.id);

    return () => {
      // Only kill this specific trigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      tl.kill();
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, animationEnd, blurStrength]);

  return (
    <div ref={containerRef} className={`scroll-reveal-section ${containerClassName} ${revealClassName}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
