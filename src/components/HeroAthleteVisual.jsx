import React from 'react';

const HeroAthleteVisual = () => {
  return (
    <div className="relative w-full max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex items-center justify-center lg:justify-end select-none">
      
      {/* 1. Subtle warm ambient atmospheric glow in the background */}
      <div 
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[420px] sm:w-[540px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(250, 168, 2, 0.18) 0%, rgba(250, 168, 2, 0.05) 45%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      {/* 2. Seamless Editorial Photograph Container (Zero cards, zero borders, pure blend) */}
      <div className="relative z-10 w-full overflow-hidden">
        <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11] overflow-hidden">
          
          {/* Authentic Athlete Photograph */}
          <img 
            src="/assets/images/hero-athlete.jpg" 
            alt="ATOSfit Athlete"
            className="w-full h-full object-cover object-center scale-[1.01]"
            style={{
              filter: 'contrast(1.06) brightness(1.02)',
            }}
          />

          {/* 
            Masterful Seamless Gradient Blends:
            - Left blend: dissolves the left edge naturally into the dark canvas so typography sits over darkness
            - Bottom blend: dissolves the floor into the section bottom
            - Top blend: smooth transition from navbar
            - Radial vignette: softens corners exactly like high-end luxury editorial mockups
          */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to right, #08080A 0%, rgba(8, 8, 10, 0.95) 8%, rgba(8, 8, 10, 0.4) 22%, transparent 40%, transparent 80%, rgba(8, 8, 10, 0.6) 100%),
                linear-gradient(to bottom, #08080A 0%, transparent 12%, transparent 68%, #08080A 100%),
                radial-gradient(ellipse at 65% 50%, transparent 40%, rgba(8, 8, 10, 0.4) 75%, #08080A 100%)
              `
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroAthleteVisual;
