import React, { useState } from "react";

type TextInputProps = {
  pokemonName: string;
};

export default function TextInput({ pokemonName }: TextInputProps) {
  const [open, setOpen] = useState(false);

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
    <form
      className={`mx-auto max-w-sm p-4 ${!open && "cursor-pointer"}`}
      onMouseDown={() => setOpen(true)}
      onSubmit={() => {}}
    >
      <div
        onMouseLeave={handleMouseLeave}
        className={`mb-2 flex scale-y-100 select-none justify-between overflow-hidden border-base-content font-mono text-2xl lowercase transition-all duration-100 ${
          open ? "max-h-36 border-2" : "max-h-0 border-0"
        }`}
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
      <div
        className={`textarea-bordered textarea w-full cursor-default overflow-hidden text-xl ${
          !open && "cursor-pointer"
        }`}
      >
        {inputValue.length > 0 ? (
          inputValue
        ) : (
          <span className="text-neutral-content">
            {open ? "use above to enter text..." : "+ new post..."}
          </span>
        )}
      </div>
      <div className="flex justify-between">
        <button
          type="reset"
          className={`btn-outline btn ${!open && "hidden"}`}
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
          className={`btn-primary btn ${!open && "hidden"}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          Post
        </button>
      </div>
    </form>
  );
}
