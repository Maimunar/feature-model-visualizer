import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { beautifyText, getPlaceholder } from "./utils";

export default function Input({
  input,
  setInput,
  setError,
}: {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
}) {
  const placeholder = useMemo(() => getPlaceholder(), []);
  useEffect(() => {
    setInput(placeholder);
  }, [setInput, placeholder]);

  return (
    <div className="flex flex-col w-1/3 px-4">
      <div className="flex">
        <button
          className="w-1/2 bg-gray-500 text-white p-2 mx-4 mb-2 rounded-md hover:bg-gray-600"
          onClick={() => navigator.clipboard.writeText(input)}
        >
          Copy
        </button>
        <button
          className="prettify w-1/2 bg-blue-500 text-white p-2 mx-4 mb-2 rounded-md hover:bg-blue-600"
          onClick={() => {
            try {
              setInput(beautifyText(JSON.parse(input)));
            } catch (e) {
              // make this button's background red
              const btn = document.querySelector(".prettify");
              btn?.classList.add("bg-red-500");
              btn?.classList.add("hover:bg-red-500");
              setTimeout(() => {
                btn?.classList.remove("bg-red-500");
                btn?.classList.remove("hover:bg-red-500");
              }, 3000);
              setError("Invalid JSON");
              console.log(e);
            }
          }}
        >
          Prettify
        </button>
      </div>
      <textarea
        className="w-full min-h-[--fulloutline] resize-none text-black"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      ></textarea>
    </div>
  );
}
