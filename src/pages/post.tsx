import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

function updateTextareaSize(textarea?: HTMLTextAreaElement | null) {
  if (textarea == null) return;
  textarea.style.height = "0";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export default function PostPage({ pokemonName = "charmander" }) {
  const [hoverIndex, setHoverIndex] = useState(-1);
  function handleMouseOver(index: number) {
    setHoverIndex(index);
  }

  function handleMouseLeave() {
    setHoverIndex(-1);
  }

  const [inputValue, setInputValue] = useState("");
  function handleMouseDown(index: number) {
    setInputValue((prev) => `${prev} ${pokemonName.slice(0, index + 1)}`);
  }

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useCallback((textarea: HTMLTextAreaElement) => {
    updateTextareaSize(textarea);
    textareaRef.current = textarea;
  }, []);

  useLayoutEffect(() => {
    updateTextareaSize(textareaRef.current);
  }, [inputValue]);

  return (
    <div>
      posting
      <form className="p-4">
        <div
          onMouseLeave={handleMouseLeave}
          className="flex max-w-xs select-none justify-between border-2 border-base-content font-mono text-4xl lowercase tracking-widest"
        >
          {pokemonName.split("").map((char, index) => (
            <div
              className={`py-4 first:pl-4 last:pr-4 ${
                hoverIndex >= index ? "bg-info" : "bg-none"
              }`}
              key={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseOver={() => handleMouseOver(index)}
            >
              {char}
            </div>
          ))}
        </div>
        <textarea
          disabled
          ref={inputRef}
          value={inputValue}
          className="textarea-bordered textarea w-full resize-none overflow-hidden"
        />
      </form>
    </div>
  );
}
