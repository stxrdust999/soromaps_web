"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

/**
 * Alterna palavras sequenciais com transição fluida de slide e desfoque elástico.
 */
export function FlipWords({
  words,
  duration = 3000,
  className,
}: FlipWordsProps) {
  const [currentWord, setCurrentWord] = useState(words[0] ?? "");
  const [isVisible, setIsVisible] = useState(true);

  const startAnimation = useCallback(() => {
    const nextIndex = (words.indexOf(currentWord) + 1) % words.length;
    const nextWord = words[nextIndex] ?? "";
    setCurrentWord(nextWord);
    setIsVisible(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isVisible) return;

    const intervalTimer = setTimeout(() => {
      startAnimation();
    }, duration);

    return () => clearTimeout(intervalTimer);
  }, [isVisible, duration, startAnimation]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsVisible(true);
      }}
    >
      <motion.span
        key={currentWord}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -40,
          x: 20,
          filter: "blur(6px)",
          scale: 1.5,
          position: "absolute",
        }}
        className={cn(
          "inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2",
          className,
        )}
      >
        {currentWord.split(" ").map((wordPart, wordIndex) => (
          <motion.span
            key={`${wordPart}-${wordIndex}`}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: wordIndex * 0.1,
              duration: 0.35,
            }}
            className="inline-block whitespace-nowrap"
          >
            {wordPart.split("").map((letter, letterIndex) => (
              <motion.span
                key={`${wordPart}-${letterIndex}`}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.1 + letterIndex * 0.03,
                  duration: 0.25,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
