const HeroCurveWave = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden">
      {/* Main Curved Wave */}
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        {/* Gold accent line */}
        <path
          d="M0 60C240 20 480 100 720 60C960 20 1200 100 1440 60"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeOpacity="0.6"
          fill="none"
        />
        
        {/* Main wave shape - White/Background */}
        <path
          d="M0 80C240 40 480 120 720 80C960 40 1200 120 1440 80V120H0V80Z"
          fill="hsl(var(--background))"
        />
        
        {/* Subtle overlay wave */}
        <path
          d="M0 90C360 50 720 110 1080 70C1260 50 1350 90 1440 100V120H0V90Z"
          fill="hsl(var(--background))"
          fillOpacity="0.8"
        />
      </svg>
      
      {/* Decorative gold dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        <span className="w-2 h-2 rounded-full bg-accent/60" />
        <span className="w-3 h-3 rounded-full bg-accent shadow-gold" />
        <span className="w-2 h-2 rounded-full bg-accent/60" />
      </div>
    </div>
  );
};

export default HeroCurveWave;
