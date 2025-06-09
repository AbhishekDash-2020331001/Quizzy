"use client";

import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export const CreateQuizAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto overflow-hidden rounded-xl border bg-background md:aspect-[4/3] lg:aspect-square"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-20"></div>
      <div className="flex h-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
          className="relative w-full max-w-[80%] rounded-lg border bg-background p-4 shadow-lg"
        >
          <motion.div
            className="flex items-center gap-2 border-b pb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="h-5 w-5 text-muted-foreground"
            >
              <FileText />
            </motion.div>
            <motion.span
              className="text-sm font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Creating Quiz from "Machine Learning Basics.pdf"
            </motion.span>
          </motion.div>
          <motion.div
            className="mt-3 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="h-4 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 rounded-md bg-gray-200 animate-pulse" />
          </motion.div>
          <motion.div
            className="mt-4 flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-md bg-primary px-4 py-2 text-xs text-primary-foreground hover:bg-primary/90"
            >
              Generate Quiz
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
