"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CTASection() {
  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={{ opacity: 0, y: 50 }}
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
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              Get Started Today
            </motion.div>
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Ready to Transform Your Learning Experience?
            </motion.h2>
            <motion.p
              className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of educators and students who are already using
              Quizzy.
            </motion.p>
          </div>
          <motion.div
            className="w-full max-w-sm space-y-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.form
              className="flex w-full max-w-sm items-center space-x-2"
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="flex-1"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <Button type="submit" className="relative overflow-hidden">
                  Sign Up
                </Button>
              </motion.div>
            </motion.form>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
            >
              Start with our free plan. No credit card required.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
