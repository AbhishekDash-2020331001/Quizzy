"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Upload Your PDFs",
    description: "Upload one or multiple PDF documents to our secure platform.",
  },
  {
    number: "2",
    title: "Choose Quiz Type",
    description:
      "Select from topic-based, page range, or multi-PDF quiz options.",
  },
  {
    number: "3",
    title: "Generate & Share",
    description:
      "Our AI creates questions, and you can share the quiz with participants.",
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

const stepVariants = {
  hidden: {
    opacity: 0,
    y: 50,
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

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-2">
            <motion.div
              className="inline-block rounded-lg bg-muted px-3 py-1 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              How It Works
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Create Quizzes in Minutes
            </motion.h2>
            <motion.p
              className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our simple process makes it easy to go from PDF to quiz in just a
              few steps.
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
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-4 text-center"
              variants={stepVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white"
                whileHover={{
                  scale: 1.2,
                  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="text-xl font-bold"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.number}
                </motion.span>
              </motion.div>
              <motion.h3
                className="text-xl font-bold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
              >
                {step.title}
              </motion.h3>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
              >
                {step.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
