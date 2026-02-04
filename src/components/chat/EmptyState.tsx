import { motion } from 'framer-motion';
import { ArrowRight, Code2, PenLine, Lightbulb, ImageIcon, FileSearch, Zap } from 'lucide-react';

const suggestions = [
  {
    icon: FileSearch,
    title: "Budget Overview",
    prompt: "What are the key highlights of the Union Budget 2026-27?",
  },
  {
    icon: Lightbulb,
    title: "Tax Changes",
    prompt: "What are the major tax reforms and changes in this budget?",
  },
  {
    icon: Zap,
    title: "Sector Analysis",
    prompt: "Which sectors received the highest allocation in this budget?",
  },
  {
    icon: PenLine,
    title: "Infrastructure",
    prompt: "What infrastructure projects are planned in this budget?",
  },
  {
    icon: Code2,
    title: "Healthcare",
    prompt: "What are the healthcare initiatives and allocations?",
  },
  {
    icon: ImageIcon,
    title: "Education",
    prompt: "What are the education sector allocations and initiatives?",
  },
];

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-16 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto text-center"
      >
        {/* Government Image - Union Budget */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <img
            src="/government.png"
            alt="Union Budget 2026-27"
            className="w-24 h-24 md:w-28 md:h-28 object-contain opacity-80"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-3 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
        >
          Your Budget, Your Impact
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-2 text-base text-muted-foreground md:text-lg font-medium"
        >
          Union Budget 2026-27 Information
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-2 text-sm text-muted-foreground/80"
        >
          powered by HCL Tech
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 text-base text-muted-foreground md:text-lg"
        >
          Ask me anything about finance, the Union Budget, or choose from the suggestions below
        </motion.p>

        {/* Suggestion Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                  <suggestion.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="font-medium text-sm">{suggestion.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.prompt}</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 absolute top-5 right-5" />
            </motion.button>
          ))}
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 text-xs text-muted-foreground/60"
        >
          Press <kbd className="rounded border border-border bg-muted px-2 py-1 text-[10px] font-mono">Enter</kbd> to send, <kbd className="rounded border border-border bg-muted px-2 py-1 text-[10px] font-mono">Shift + Enter</kbd> for new line
        </motion.p>
      </motion.div>
    </div>
  );
}
