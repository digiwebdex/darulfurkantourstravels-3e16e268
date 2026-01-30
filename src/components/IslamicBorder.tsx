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
        <div className="absolute top-0 left-0 right-0 h-14 overflow-hidden pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center"
          >
            <svg 
              viewBox="0 0 1400 50" 
              className="w-full max-w-6xl h-14"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Left crescent moon */}
              <motion.g
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <path 
                  d="M50,25 A12,12 0 1,1 50,26 A8,8 0 1,0 50,25" 
                  className="fill-secondary"
                />
                <circle cx="62" cy="18" r="2" className="fill-secondary" />
              </motion.g>

              {/* Left arabesque arches */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <path
                  d="M90,35 Q110,10 130,35 M130,35 Q150,10 170,35 M170,35 Q190,10 210,35 M210,35 Q230,10 250,35"
                  className="stroke-primary/40 fill-none"
                  strokeWidth="1.5"
                />
                <circle cx="110" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="150" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="190" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="230" cy="18" r="2" className="fill-secondary/60" />
              </motion.g>

              {/* Left interlocking hexagons */}
              <motion.g
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <polygon 
                  points="300,25 310,15 330,15 340,25 330,35 310,35" 
                  className="stroke-secondary fill-secondary/10"
                  strokeWidth="1.5"
                />
                <polygon 
                  points="340,25 350,15 370,15 380,25 370,35 350,35" 
                  className="stroke-secondary fill-secondary/10"
                  strokeWidth="1.5"
                />
              </motion.g>

              {/* Left decorative line with diamonds */}
              <motion.path
                d="M400,25 L450,25 L460,15 L470,25 L520,25 L530,15 L540,25 L590,25"
                className="stroke-secondary fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />

              {/* Center 8-pointed star with mosque dome */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {/* Outer 8-pointed star */}
                <polygon 
                  points="700,5 710,18 725,18 715,25 725,32 710,32 700,45 690,32 675,32 685,25 675,18 690,18" 
                  className="fill-secondary"
                />
                {/* Inner decoration */}
                <circle cx="700" cy="25" r="6" className="fill-primary" />
                <circle cx="700" cy="25" r="3" className="fill-secondary" />
                
                {/* Side crescents */}
                <path d="M660,25 A6,6 0 1,1 660,26 A4,4 0 1,0 660,25" className="fill-secondary/60" />
                <path d="M740,25 A6,6 0 1,0 740,26 A4,4 0 1,1 740,25" className="fill-secondary/60" />
              </motion.g>

              {/* Right decorative line with diamonds */}
              <motion.path
                d="M810,25 L860,25 L870,15 L880,25 L930,25 L940,15 L950,25 L1000,25"
                className="stroke-secondary fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />

              {/* Right interlocking hexagons */}
              <motion.g
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <polygon 
                  points="1020,25 1030,15 1050,15 1060,25 1050,35 1030,35" 
                  className="stroke-secondary fill-secondary/10"
                  strokeWidth="1.5"
                />
                <polygon 
                  points="1060,25 1070,15 1090,15 1100,25 1090,35 1070,35" 
                  className="stroke-secondary fill-secondary/10"
                  strokeWidth="1.5"
                />
              </motion.g>

              {/* Right arabesque arches */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <path
                  d="M1150,35 Q1170,10 1190,35 M1190,35 Q1210,10 1230,35 M1230,35 Q1250,10 1270,35 M1270,35 Q1290,10 1310,35"
                  className="stroke-primary/40 fill-none"
                  strokeWidth="1.5"
                />
                <circle cx="1170" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="1210" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="1250" cy="18" r="2" className="fill-secondary/60" />
                <circle cx="1290" cy="18" r="2" className="fill-secondary/60" />
              </motion.g>

              {/* Right crescent moon */}
              <motion.g
                initial={{ scale: 0, rotate: 90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <path 
                  d="M1350,25 A12,12 0 1,0 1350,26 A8,8 0 1,1 1350,25" 
                  className="fill-secondary"
                />
                <circle cx="1338" cy="18" r="2" className="fill-secondary" />
              </motion.g>
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Content */}
      {children}
      
      {/* Bottom Border */}
      {(variant === "bottom" || variant === "both") && (
        <div className="absolute bottom-0 left-0 right-0 h-14 overflow-hidden pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center"
          >
            <svg 
              viewBox="0 0 1400 50" 
              className="w-full max-w-6xl h-14 rotate-180"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Same pattern as top, mirrored */}
              <motion.g
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <path 
                  d="M50,25 A12,12 0 1,1 50,26 A8,8 0 1,0 50,25" 
                  className="fill-secondary/70"
                />
                <circle cx="62" cy="18" r="2" className="fill-secondary/70" />
              </motion.g>

              <motion.g
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <path
                  d="M90,35 Q110,10 130,35 M130,35 Q150,10 170,35 M170,35 Q190,10 210,35 M210,35 Q230,10 250,35"
                  className="stroke-primary/30 fill-none"
                  strokeWidth="1.5"
                />
                <circle cx="110" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="150" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="190" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="230" cy="18" r="2" className="fill-secondary/50" />
              </motion.g>

              <motion.g
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <polygon 
                  points="300,25 310,15 330,15 340,25 330,35 310,35" 
                  className="stroke-secondary/70 fill-secondary/5"
                  strokeWidth="1.5"
                />
                <polygon 
                  points="340,25 350,15 370,15 380,25 370,35 350,35" 
                  className="stroke-secondary/70 fill-secondary/5"
                  strokeWidth="1.5"
                />
              </motion.g>

              <motion.path
                d="M400,25 L450,25 L460,15 L470,25 L520,25 L530,15 L540,25 L590,25"
                className="stroke-secondary/70 fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <polygon 
                  points="700,5 710,18 725,18 715,25 725,32 710,32 700,45 690,32 675,32 685,25 675,18 690,18" 
                  className="fill-secondary/70"
                />
                <circle cx="700" cy="25" r="6" className="fill-primary/70" />
                <circle cx="700" cy="25" r="3" className="fill-secondary/70" />
                <path d="M660,25 A6,6 0 1,1 660,26 A4,4 0 1,0 660,25" className="fill-secondary/50" />
                <path d="M740,25 A6,6 0 1,0 740,26 A4,4 0 1,1 740,25" className="fill-secondary/50" />
              </motion.g>

              <motion.path
                d="M810,25 L860,25 L870,15 L880,25 L930,25 L940,15 L950,25 L1000,25"
                className="stroke-secondary/70 fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              <motion.g
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <polygon 
                  points="1020,25 1030,15 1050,15 1060,25 1050,35 1030,35" 
                  className="stroke-secondary/70 fill-secondary/5"
                  strokeWidth="1.5"
                />
                <polygon 
                  points="1060,25 1070,15 1090,15 1100,25 1090,35 1070,35" 
                  className="stroke-secondary/70 fill-secondary/5"
                  strokeWidth="1.5"
                />
              </motion.g>

              <motion.g
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <path
                  d="M1150,35 Q1170,10 1190,35 M1190,35 Q1210,10 1230,35 M1230,35 Q1250,10 1270,35 M1270,35 Q1290,10 1310,35"
                  className="stroke-primary/30 fill-none"
                  strokeWidth="1.5"
                />
                <circle cx="1170" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="1210" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="1250" cy="18" r="2" className="fill-secondary/50" />
                <circle cx="1290" cy="18" r="2" className="fill-secondary/50" />
              </motion.g>

              <motion.g
                initial={{ scale: 0, rotate: 90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <path 
                  d="M1350,25 A12,12 0 1,0 1350,26 A8,8 0 1,1 1350,25" 
                  className="fill-secondary/70"
                />
                <circle cx="1338" cy="18" r="2" className="fill-secondary/70" />
              </motion.g>
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Corner ornaments - Islamic geometric style */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="absolute top-1 left-1 w-10 h-10 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <path d="M0,0 L40,0 L40,8 L8,8 L8,40 L0,40 Z" className="fill-primary/15" />
          <polygon points="20,4 24,12 20,20 16,12" className="fill-secondary/50" />
          <circle cx="20" cy="12" r="2" className="fill-primary/40" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="absolute top-1 right-1 w-10 h-10 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full rotate-90">
          <path d="M0,0 L40,0 L40,8 L8,8 L8,40 L0,40 Z" className="fill-primary/15" />
          <polygon points="20,4 24,12 20,20 16,12" className="fill-secondary/50" />
          <circle cx="20" cy="12" r="2" className="fill-primary/40" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="absolute bottom-1 left-1 w-10 h-10 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <path d="M0,0 L40,0 L40,8 L8,8 L8,40 L0,40 Z" className="fill-primary/15" />
          <polygon points="20,4 24,12 20,20 16,12" className="fill-secondary/50" />
          <circle cx="20" cy="12" r="2" className="fill-primary/40" />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="absolute bottom-1 right-1 w-10 h-10 pointer-events-none hidden md:block"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full rotate-180">
          <path d="M0,0 L40,0 L40,8 L8,8 L8,40 L0,40 Z" className="fill-primary/15" />
          <polygon points="20,4 24,12 20,20 16,12" className="fill-secondary/50" />
          <circle cx="20" cy="12" r="2" className="fill-primary/40" />
        </svg>
      </motion.div>
    </div>
  );
};

export default IslamicBorder;
