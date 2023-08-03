import React, { useEffect, useState } from "react";
import { IconMap } from "~/utils/IconsMap";

const MAX_LENGTH = 255;

type TextInputProps = {
  pokemonName: string;
  placeholderText: string;
  handleSubmit: (text: string) => void;
};

export default function TextInput({
  pokemonName,
  placeholderText,
  handleSubmit,
}: TextInputProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const [hoverIndex, setHoverIndex] = useState(-1);
  function handleMouseOver(index: number) {
    setHoverIndex(index);
  }

  function handleMouseLeave() {
    setHoverIndex(-1);
  }

  const [inputValue, setInputValue] = useState("");

  function handleMouseUp(index: number) {
    if (inputValue.length > MAX_LENGTH) return;

    setInputValue((prev) =>
      `${prev} ${pokemonName.slice(0, index + 1)}`.trim()
    );
  }

  function handlePunctuation(punctuation: string) {
    if (inputValue.length > MAX_LENGTH) return;

    setInputValue((prev) => `${prev}${punctuation}`);
  }

  function handleDelete() {
    setInputValue((prev) => prev.substring(0, prev.lastIndexOf(" ")));
  }

  return (
    <form
      className={`mx-auto max-w-sm p-4 pb-2 ${open ? "" : "cursor-pointer"}`}
      onMouseDown={() => setOpen(true)}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {/* INPUT */}
      <div
        onMouseLeave={handleMouseLeave}
        className={`flex scale-y-100 select-none justify-between overflow-hidden border-base-content font-mono text-2xl lowercase transition-all duration-100 ${
          open ? "mb-2 max-h-36 border-2" : "mb-0 max-h-0 border-0"
        }`}
      >
        {pokemonName.split("").map((char, index) => (
          <div
            className={`flex-grow py-4 text-center first:pl-4 last:pr-4 ${
              hoverIndex >= index ? "bg-info" : "bg-none"
            } ${inputValue.length > MAX_LENGTH ? "text-base-300" : ""}`}
            key={index}
            onMouseUp={() => handleMouseUp(index)}
            onMouseOver={() => handleMouseOver(index)}
          >
            {char}
          </div>
        ))}
      </div>

      {/* INPUT BUTTONS */}
      <div className={`flex justify-between p-4 pt-1 ${open ? "hidden" : ""}`}>
        {/* PUNCTUATION BUTTONS */}
        <div className="join items-center">
          <button
            className="btn-square join-item btn"
            disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation(".")}
          >
            .
          </button>
          <button
            className="btn-square join-item btn"
            disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation("!")}
          >
            !
          </button>
          <button
            className="btn-square join-item btn"
            disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation("?")}
          >
            ?
          </button>
        </div>
        {/* DELETE BUTTON */}
        <button
          type="button"
          className="btn-ghost btn-active btn"
          onClick={handleDelete}
        >
          <span className="h-4 w-4">{IconMap.undo}</span>
          DELETE
        </button>
      </div>

      {/* TEXT DISPLAY */}
      <div
        className={`textarea-bordered textarea mb-4 w-full cursor-default overflow-hidden text-xl ${
          open ? "" : "cursor-pointer"
        }`}
      >
        {inputValue.length > 0 ? (
          inputValue
        ) : (
          <span className="text-neutral-content">
            {open ? "Use above to enter text..." : placeholderText}
          </span>
        )}
      </div>

      {/* CANCEL AND CLOSE BUTTONS */}
      <div className="flex justify-between">
        <button
          type="reset"
          className={`btn-outline btn ${open ? "" : "hidden"}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          Cancel
        </button>
        <button
          type="reset"
          disabled={inputValue.length === 0}
          className={`btn-primary btn ${open ? "" : "hidden"}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            handleSubmit(inputValue);
          }}
        >
          Post
        </button>
      </div>
    </form>
  );
}
