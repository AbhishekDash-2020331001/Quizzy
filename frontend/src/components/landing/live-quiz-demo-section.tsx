"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Trophy } from "lucide-react";

const features = [
  "Real-time participant tracking",
  "Live leaderboard updates",
  "Interactive question display",
  "Instant feedback on answers",
  "Comprehensive results dashboard",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const featureVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function LiveQuizDemoSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Live Quiz System
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Real-time Quiz Participation
            </motion.h2>
            <motion.p
              className="max-w-[600px] text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Create engaging live quiz sessions where participants can join in
              real-time and compete against each other.
            </motion.p>
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-2"
                  variants={featureVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </motion.div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div
            className="relative mx-auto overflow-hidden rounded-xl border bg-background"
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-500 opacity-10"
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>
            <div className="flex h-full items-center justify-center p-6">
              <motion.div
                className="w-full max-w-[90%] rounded-lg border bg-background p-4 shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-between border-b pb-2"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Trophy className="h-5 w-5 text-blue-500" />
                    </motion.div>
                    <span className="font-medium">Machine Learning Quiz</span>
                  </div>
                  <motion.div
                    className="text-sm text-muted-foreground"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    12 Participants
                  </motion.div>
                </motion.div>
                <div className="mt-4 space-y-4">
                  <motion.div
                    className="rounded-lg bg-muted p-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <p className="font-medium">
                      What is the main difference between supervised and
                      unsupervised learning?
                    </p>
                  </motion.div>
                  <motion.div
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <motion.div
                      className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-800 p-2 text-sm"
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(59, 130, 246, 0.4)",
                          "0 0 20px rgba(59, 130, 246, 0.2)",
                          "0 0 0 rgba(59, 130, 246, 0.4)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      A. Data labeling requirements
                    </motion.div>
                    {[
                      "B. Processing speed",
                      "C. Hardware requirements",
                      "D. Programming language used",
                    ].map((option, i) => (
                      <motion.div
                        key={i}
                        className="rounded-md border p-2 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          borderColor: "rgba(59, 130, 246, 0.5)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option}
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <div className="text-sm text-muted-foreground">
                      Question 3 of 10
                    </div>
                    <motion.div
                      className="text-sm font-medium"
                      animate={{ color: ["#666", "#f59e0b", "#666"] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      00:45 remaining
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
