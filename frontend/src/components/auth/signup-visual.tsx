"use client";

import { BookOpen, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupVisual() {
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
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <h1 className="text-3xl font-bold leading-tight">
              Transform Your PDFs into Interactive Learning
            </h1>
            <p className="text-xl text-black">
              Join thousands of educators and students creating engaging quizzes
              with AI
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-6 mt-12">
            {[
              {
                icon: BookOpen,
                title: "Smart Quiz Generation",
                description: "AI-powered questions from your PDFs",
              },
              {
                icon: Users,
                title: "Collaborative Learning",
                description: "Share quizzes and compete with others",
              },
              {
                icon: Trophy,
                title: "Track Progress",
                description: "Leaderboards and detailed analytics",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="p-2 bg-yellow-primary/30 rounded-lg"
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 },
                  }}
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <div className="text-left">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-black">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            {[
              { value: "1K+", label: "Active Users" },
              { value: "5K+", label: "Quizzes Created" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 1.0 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-black">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
