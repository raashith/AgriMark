'use client';

import React, { useEffect } from 'react';

export const ScrollRevealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const revealSections = document.querySelectorAll('.reveal-section');
    if (!revealSections.length) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealSections.forEach((section) => revealObserver.observe(section));

    return () => {
      revealSections.forEach((section) => revealObserver.unobserve(section));
    };
  }, []);

  return <>{children}</>;
};
