import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  // Floating food items
  const floatingItems = [
    { emoji: "🍕", x: "10%", y: "20%", delay: 0, duration: 20 },
    { emoji: "🍔", x: "85%", y: "15%", delay: 2, duration: 25 },
    { emoji: "🍣", x: "75%", y: "70%", delay: 4, duration: 22 },
    { emoji: "🥗", x: "15%", y: "80%", delay: 1, duration: 18 },
    { emoji: "🍜", x: "45%", y: "10%", delay: 3, duration: 24 },
    { emoji: "🍰", x: "90%", y: "45%", delay: 5, duration: 21 },
    { emoji: "🥘", x: "5%", y: "50%", delay: 2.5, duration: 19 },
    { emoji: "🍷", x: "60%", y: "85%", delay: 1.5, duration: 23 },
    { emoji: "🌮", x: "30%", y: "30%", delay: 3.5, duration: 26 },
    { emoji: "🍦", x: "50%", y: "60%", delay: 4.5, duration: 20 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900">
        {/* Animated gradient overlay */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(168,85,247,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(59,130,246,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, rgba(236,72,153,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, rgba(168,85,247,0.3) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
      </div>

      {/* Animated Food Particles */}
      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl md:text-6xl opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, 0, -20, 0],
            rotate: [0, 10, 0, -10, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Animated Shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Pulsing circles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"
      />
    </div>
  );
};

export default AnimatedBackground;