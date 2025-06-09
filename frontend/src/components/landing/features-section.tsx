"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  MessageSquare,
  Share2,
  Trophy,
  Upload,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Topic-Based Quizzes",
    description:
      "Create quizzes on specific topics from a single PDF document with AI-generated questions.",
  },
  {
    icon: FileText,
    title: "Page Range Quizzes",
    description:
      "Select specific page ranges from your PDFs to create focused quizzes on particular sections.",
  },
  {
    icon: Upload,
    title: "Multi-PDF Quizzes",
    description:
      "Combine content from multiple PDFs to create comprehensive quizzes across different sources.",
  },
  {
    icon: MessageSquare,
    title: "Chat with PDFs",
    description:
      "Ask questions about your PDFs and mention specific documents using the @ symbol in the chat.",
  },
  {
    icon: Share2,
    title: "Quiz Sharing",
    description:
      "Share quizzes with others and allow multiple users to participate in your created quizzes.",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description:
      "Track performance with ranking boards to see how participants compare to each other.",
  },
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

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
    >
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
              Features
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Everything You Need for PDF-Based Quizzes
            </motion.h2>
            <motion.p
              className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our AI-powered platform makes it easy to create, share, and
              analyze quizzes from your PDF documents.
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm bg-background"
              variants={cardVariants}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                className="rounded-full bg-blue-100 p-3"
                whileHover={{
                  scale: 1.1,
                  rotate: 360,
                  transition: { duration: 0.3 },
                }}
              >
                <feature.icon className="h-6 w-6 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
