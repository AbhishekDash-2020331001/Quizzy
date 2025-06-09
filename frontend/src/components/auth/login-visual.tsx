"use client";

import { BookOpen, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginVisual() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center lg:w-1/2 relative overflow-hidden bg-white">
      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col justify-center items-center p-12 text-black"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-md text-center space-y-8">
          {/* Main Heading */}
          <motion.div
            className="space-y-4 text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h1 className="text-3xl text-center font-bold leading-tight">
              Welcome Back to Your Learning Journey
            </h1>
            <p className="text-xl text-black">
              Continue creating amazing quizzes and tracking your progress
            </p>
          </motion.div>

          {/* Recent Activity */}
          <div className="space-y-6 mt-12">
            <motion.h3
              className="text-lg font-semibold text-black"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              What's New
            </motion.h3>

            <div className="space-y-4">
              {[
                {
                  icon: BookOpen,
                  title: "New AI Features",
                  description: "Enhanced question generation",
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description: "Share quizzes with your team",
                },
                {
                  icon: Trophy,
                  title: "Advanced Analytics",
                  description: "Detailed performance insights",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.15,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 5,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className="p-2 bg-yellow-primary/30 rounded-lg"
                    whileHover={{
                      scale: 1.1,
                      rotate: -5,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <feature.icon className="h-6 w-6" />
                  </motion.div>
                  <div className="text-left">
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-black">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
