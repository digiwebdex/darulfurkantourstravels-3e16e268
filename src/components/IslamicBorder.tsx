import { motion } from "framer-motion";

interface IslamicBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: "top" | "bottom" | "both";
}

const IslamicBorder = ({ children, className = "", variant = "both" }: IslamicBorderProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Top Border */}
      {(variant === "top" || variant === "both") && (
        <div className="absolute top-0 left-0 right-0 h-12 overflow-hidden pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center"
          >
            <svg 
              viewBox="0 0 1200 40" 
              className="w-full max-w-5xl h-10"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Left small star */}
              <motion.g
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <polygon 
                  points="80,20 84,12 92,12 86,6 88,0 80,4 72,0 74,6 68,12 76,12" 
                  className="fill-secondary"
                />
              </motion.g>
              
              {/* Left zigzag line */}
              <motion.path
                d="M110,20 L160,20 L175,8 L190,20 L220,20 L235,8 L250,20 L280,20 L295,8 L310,20 L340,20 L355,8 L370,20 L400,20 L415,8 L430,20 L460,20 L475,8 L490,20 L520,20 L535,8 L550,20"
                className="stroke-secondary fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
              
              {/* Center 4-pointed star */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {/* Outer star shape */}
                <polygon 
                  points="600,2 608,14 620,20 608,26 600,38 592,26 580,20 592,14" 
                  className="fill-secondary"
                />
                {/* Inner diamond */}
                <polygon 
                  points="600,10 606,20 600,30 594,20" 
                  className="fill-primary"
                />
              </motion.g>
              
              {/* Right zigzag line */}
              <motion.path
                d="M650,20 L680,20 L695,8 L710,20 L740,20 L755,8 L770,20 L800,20 L815,8 L830,20 L860,20 L875,8 L890,20 L920,20 L935,8 L950,20 L980,20 L995,8 L1010,20 L1040,20 L1055,8 L1070,20 L1090,20"
                className="stroke-secondary fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
              
              {/* Right small star */}
              <motion.g
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <polygon 
                  points="1120,20 1124,12 1132,12 1126,6 1128,0 1120,4 1112,0 1114,6 1108,12 1116,12" 
                  className="fill-secondary"
                />
              </motion.g>
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Content */}
      {children}
      
      {/* Bottom Border */}
      {(variant === "bottom" || variant === "both") && (
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center"
          >
            <svg 
              viewBox="0 0 1200 40" 
              className="w-full max-w-5xl h-10 rotate-180"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Left small star */}
              <motion.g
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <polygon 
                  points="80,20 84,12 92,12 86,6 88,0 80,4 72,0 74,6 68,12 76,12" 
                  className="fill-secondary/80"
                />
              </motion.g>
              
              {/* Left zigzag line */}
              <motion.path
                d="M110,20 L160,20 L175,8 L190,20 L220,20 L235,8 L250,20 L280,20 L295,8 L310,20 L340,20 L355,8 L370,20 L400,20 L415,8 L430,20 L460,20 L475,8 L490,20 L520,20 L535,8 L550,20"
                className="stroke-secondary/80 fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              
              {/* Center 4-pointed star */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <polygon 
                  points="600,2 608,14 620,20 608,26 600,38 592,26 580,20 592,14" 
                  className="fill-secondary/80"
                />
                <polygon 
                  points="600,10 606,20 600,30 594,20" 
                  className="fill-primary/80"
                />
              </motion.g>
              
              {/* Right zigzag line */}
              <motion.path
                d="M650,20 L680,20 L695,8 L710,20 L740,20 L755,8 L770,20 L800,20 L815,8 L830,20 L860,20 L875,8 L890,20 L920,20 L935,8 L950,20 L980,20 L995,8 L1010,20 L1040,20 L1055,8 L1070,20 L1090,20"
                className="stroke-secondary/80 fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              
              {/* Right small star */}
              <motion.g
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <polygon 
                  points="1120,20 1124,12 1132,12 1126,6 1128,0 1120,4 1112,0 1114,6 1108,12 1116,12" 
                  className="fill-secondary/80"
                />
              </motion.g>
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Corner ornaments */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="absolute top-2 left-2 w-8 h-8 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <path d="M0,0 L32,0 L32,6 L6,6 L6,32 L0,32 Z" className="fill-primary/20" />
          <polygon points="16,3 18,8 16,13 14,8" className="fill-secondary/60" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="absolute top-2 right-2 w-8 h-8 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full rotate-90">
          <path d="M0,0 L32,0 L32,6 L6,6 L6,32 L0,32 Z" className="fill-primary/20" />
          <polygon points="16,3 18,8 16,13 14,8" className="fill-secondary/60" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="absolute bottom-2 left-2 w-8 h-8 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          <path d="M0,0 L32,0 L32,6 L6,6 L6,32 L0,32 Z" className="fill-primary/20" />
          <polygon points="16,3 18,8 16,13 14,8" className="fill-secondary/60" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="absolute bottom-2 right-2 w-8 h-8 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full rotate-180">
          <path d="M0,0 L32,0 L32,6 L6,6 L6,32 L0,32 Z" className="fill-primary/20" />
          <polygon points="16,3 18,8 16,13 14,8" className="fill-secondary/60" />
        </svg>
      </motion.div>
    </div>
  );
};

export default IslamicBorder;
