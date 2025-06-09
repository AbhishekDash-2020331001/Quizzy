"use client";

import { motion } from "framer-motion";
import { Users, FileQuestion, BarChart3 } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1,000+",
    label: "Active Users",
  },
  {
    icon: FileQuestion,
    value: "5,000+",
    label: "Quizzes Created",
  },
  {
    icon: BarChart3,
    value: "98%",
    label: "User Satisfaction",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export function StatisticsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-2">
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Track Your Progress
            </motion.h2>
            <motion.p
              className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Comprehensive analytics to monitor quiz performance and
              participant engagement.
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center justify-between rounded-lg border bg-background p-8 shadow-sm"
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2 + 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.2,
                  rotate: 360,
                  transition: { duration: 0.6 },
                }}
              >
                <stat.icon className="h-12 w-12 text-blue-500" />
              </motion.div>
              <div className="mt-4 text-center">
                <motion.div
                  className="text-4xl font-bold"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2 + 0.7,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {stat.value}
                </motion.div>
                <motion.div
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2 + 0.9,
                  }}
                >
                  {stat.label}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
