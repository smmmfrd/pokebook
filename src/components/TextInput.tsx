import React, { useState } from "react";

type TextInputProps = {
  pokemonName: string;
};

export default function TextInput({ pokemonName }: TextInputProps) {
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

  return (
    <form className="mx-auto max-w-sm p-4">
      <div
        onMouseLeave={handleMouseLeave}
        className={`mb-2 flex select-none justify-between border-2 border-base-content font-mono text-2xl lowercase `}
      >
        {pokemonName.split("").map((char, index) => (
          <div
            className={`flex-grow py-4 text-center first:pl-4 last:pr-4 ${
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
      <div className="textarea-bordered textarea w-full cursor-default overflow-hidden text-xl">
        {inputValue.length > 0 ? (
          inputValue
        ) : (
          <span className="text-base-300">+ new post</span>
        )}
      </div>
    </form>
  );
}
