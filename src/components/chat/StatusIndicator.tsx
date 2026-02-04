import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusIndicatorProps {
  isLoading: boolean;
}

const statusMessages = [
  'Detecting language...',
  'Translating query...',
  'Searching documents...',
  'Retrieving context...',
  'Generating response...',
];

export function StatusIndicator({ isLoading }: StatusIndicatorProps) {
  const [currentStatus, setCurrentStatus] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStatus(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Progress through statuses based on time
      if (elapsed < 1.5) {
        setCurrentStatus(0); // Detecting language
      } else if (elapsed < 3) {
        setCurrentStatus(1); // Translating
      } else if (elapsed < 5) {
        setCurrentStatus(2); // Searching documents
      } else if (elapsed < 7) {
        setCurrentStatus(3); // Retrieving context
      } else {
        setCurrentStatus(4); // Generating response
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border overflow-hidden">
          <img
            src="/nirmala-sitharaman.png"
            alt="Nirmala Sitharaman"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {statusMessages[currentStatus]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
