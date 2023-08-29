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

  // This is a control variable to make sure the mouse up event was started by the user first clicking down on one of the characters.
  const [goodInput, setGoodInput] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => setGoodInput(false);

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.addEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const [hoverIndex, setHoverIndex] = useState(-1);
  function handleMouseOver(index: number) {
    setHoverIndex(index);
  }

  function handleMouseLeave() {
    setHoverIndex(-1);
  }

  const [inputValue, setInputValue] = useState("");

  function handleMouseUp(index: number) {
    if (inputValue.length > MAX_LENGTH || !goodInput) return;

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
      className={`p-4 pb-2 ${open ? "" : "cursor-pointer"}`}
      onMouseDown={(e) => {
        if (!open) {
          e.stopPropagation();
          setGoodInput(false);
          setOpen(true);
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {/* INPUT */}
      <div
        onMouseLeave={handleMouseLeave}
        className={`flex scale-y-100 select-none justify-between overflow-hidden border-base-content font-mono text-2xl lowercase transition-all duration-100 ${
          open ? " max-h-36 border-2" : " max-h-0 border-0"
        }`}
      >
        {pokemonName.split("").map((char, index) => (
          <div
            className={`flex-grow py-4 text-center uppercase first:pl-4 last:pr-4 ${
              hoverIndex >= index ? "bg-primary" : "bg-none"
            } ${inputValue.length > MAX_LENGTH ? "text-base-300" : ""}`}
            key={index}
            onMouseDown={(e) => {
              e.stopPropagation();
              setGoodInput(true);
            }}
            onMouseUp={() => handleMouseUp(index)}
            onMouseOver={() => handleMouseOver(index)}
          >
            {char}
          </div>
        ))}
      </div>

      {/* INPUT BUTTONS */}
      <div
        className={`content mb-4 flex justify-between overflow-hidden transition-all duration-200 ${
          open && inputValue.length > 0 ? "max-h-12" : "max-h-0"
        }`}
      >
        {/* PUNCTUATION BUTTONS */}
        <div className="join [&>*]:font-mono [&>*]:text-2xl [&>*]:font-bold">
          <button
            className="btn-outline join-item btn rounded-t-none border-2 border-t-0"
            // disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation(".")}
          >
            .
          </button>
          <button
            className="btn-outline join-item btn rounded-t-none border-2 border-t-0"
            // disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation("!")}
          >
            !
          </button>
          <button
            className="btn-outline join-item btn rounded-t-none border-2 border-t-0"
            // disabled={inputValue.length === 0 || inputValue.length > MAX_LENGTH}
            onClick={() => handlePunctuation("?")}
          >
            ?
          </button>
        </div>

        {/* DELETE BUTTON */}
        <button
          type="button"
          className="btn-outline btn-error btn rounded-t-none border-2 border-t-0 text-lg font-bold"
          onClick={handleDelete}
        >
          <span className="h-5 w-5">{IconMap.undo}</span>
          DELETE
        </button>
      </div>

      {/* TEXT DISPLAY */}
      <div
        className={`textarea-bordered textarea mb-4 w-full cursor-default overflow-hidden text-xl ${
          open ? "" : "cursor-pointer"
        } ${inputValue.length > 0 ? "uppercase" : ""}`}
      >
        {inputValue.length > 0 ? (
          inputValue
        ) : (
          <span className="select-none text-neutral-content">
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
