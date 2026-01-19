import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingParticlesProps {
  mousePosition: { x: number; y: number };
}

interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  shape: "circle" | "square" | "triangle" | "diamond" | "star" | "crescent";
  delay: number;
  duration: number;
  opacity: number;
  parallaxFactor: number;
}

const FloatingParticles = ({ mousePosition }: FloatingParticlesProps) => {
  const particles = useMemo<Particle[]>(() => {
    const shapes: Particle["shape"][] = ["circle", "square", "triangle", "diamond", "star", "crescent"];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      delay: Math.random() * 2,
      duration: Math.random() * 4 + 4,
      opacity: Math.random() * 0.15 + 0.05,
      parallaxFactor: (Math.random() - 0.5) * 60,
    }));
  }, []);

  const renderShape = (shape: Particle["shape"], size: number) => {
    switch (shape) {
      case "circle":
        return (
          <div
            className="rounded-full border border-secondary/30"
            style={{ width: size, height: size }}
          />
        );
      case "square":
        return (
          <div
            className="border border-secondary/30 rotate-12"
            style={{ width: size, height: size }}
          />
        );
      case "triangle":
        return (
          <div
            className="border-l border-r border-b border-secondary/30"
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
            }}
          />
        );
      case "diamond":
        return (
          <div
            className="border border-secondary/30 rotate-45"
            style={{ width: size * 0.8, height: size * 0.8 }}
          />
        );
      case "star":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className="text-secondary/30">
            <polygon
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"
            />
          </svg>
        );
      case "crescent":
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className="text-secondary/30">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              d="M12 3a9 9 0 1 0 9 9c0-4.97-4.03-9-9-9 0 3.87 2.13 7 5 7a5 5 0 0 1-5-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[7]">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
          }}
          animate={{
            x: mousePosition.x * particle.parallaxFactor,
            y: mousePosition.y * particle.parallaxFactor,
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
            rotate: {
              duration: particle.duration * 3,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [-10, 10, -10],
            }}
            transition={{
              opacity: { delay: particle.delay, duration: 0.5 },
              scale: { delay: particle.delay, duration: 0.5 },
              y: {
                delay: particle.delay,
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            {renderShape(particle.shape, particle.size)}
          </motion.div>
        </motion.div>
      ))}

      {/* Larger accent particles */}
      <motion.div
        className="absolute top-[20%] left-[10%]"
        animate={{
          x: mousePosition.x * 40,
          y: mousePosition.y * 30,
        }}
        transition={{ type: "spring", stiffness: 30, damping: 15 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border border-secondary/20 rounded-full"
        />
      </motion.div>

      <motion.div
        className="absolute top-[60%] right-[15%]"
        animate={{
          x: mousePosition.x * -35,
          y: mousePosition.y * 25,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border border-primary-foreground/15 rotate-45"
        />
      </motion.div>

      <motion.div
        className="absolute top-[40%] right-[25%]"
        animate={{
          x: mousePosition.x * 50,
          y: mousePosition.y * -40,
        }}
        transition={{ type: "spring", stiffness: 25, damping: 12 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-8 border border-secondary/15"
        />
      </motion.div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-[30%] right-[5%]"
        animate={{
          x: mousePosition.x * -25,
          y: mousePosition.y * 20,
        }}
        transition={{ type: "spring", stiffness: 35, damping: 20 }}
      >
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full bg-secondary/10 blur-xl"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-[25%] left-[20%]"
        animate={{
          x: mousePosition.x * 30,
          y: mousePosition.y * -35,
        }}
        transition={{ type: "spring", stiffness: 28, damping: 16 }}
      >
        <motion.div
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-32 h-32 rounded-full bg-primary-foreground/5 blur-2xl"
        />
      </motion.div>

      {/* Connecting lines effect */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <motion.line
          x1="10%"
          y1="20%"
          x2="30%"
          y2="40%"
          stroke="currentColor"
          strokeWidth="1"
          className="text-secondary"
          animate={{
            x1: [`10%`, `${10 + mousePosition.x * 2}%`],
            y1: [`20%`, `${20 + mousePosition.y * 2}%`],
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.line
          x1="70%"
          y1="30%"
          x2="85%"
          y2="60%"
          stroke="currentColor"
          strokeWidth="1"
          className="text-secondary"
          animate={{
            x1: [`70%`, `${70 + mousePosition.x * -3}%`],
            y1: [`30%`, `${30 + mousePosition.y * 2}%`],
          }}
          transition={{ type: "spring", stiffness: 40, damping: 18 }}
        />
        <motion.line
          x1="40%"
          y1="70%"
          x2="60%"
          y2="85%"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary-foreground"
          animate={{
            x2: [`60%`, `${60 + mousePosition.x * 2}%`],
            y2: [`85%`, `${85 + mousePosition.y * -2}%`],
          }}
          transition={{ type: "spring", stiffness: 45, damping: 22 }}
        />
      </svg>
    </div>
  );
};

export default FloatingParticles;