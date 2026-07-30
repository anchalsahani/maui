"use client";

import { useState, type PointerEvent } from "react";
import { ChevronDown } from "lucide-react";

import styles from "./FaqList.module.css";

type Faq = {
  question: string;
  answer: string;
};

export default function FaqList({ items }: { items: Faq[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function handlePointerEnter(
    index: number,
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (event.pointerType === "mouse") {
      setActiveIndex(index);
    }
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      setActiveIndex(null);
    }
  }

  function handleClick(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  return (
    <div className={styles.list}>
      {items.map((faq, index) => {
        const isOpen = activeIndex === index;
        const answerId = `faq-answer-${index}`;

        return (
          <div
            key={faq.question}
            className={styles.item}
            onPointerEnter={(event) => handlePointerEnter(index, event)}
            onPointerLeave={handlePointerLeave}
          >
            <button
              type="button"
              className={styles.question}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => handleClick(index)}
            >
              <span>{faq.question}</span>
              <ChevronDown
                size={20}
                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                aria-hidden="true"
              />
            </button>

            <div
              id={answerId}
              className={`${styles.answerShell} ${isOpen ? styles.answerOpen : ""}`}
              aria-hidden={!isOpen}
            >
              <div className={styles.answerClip}>
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
