"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { getPlaceholder } from "./utils";

export default function Home() {
  const [input, setInput] = useState("");
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl p-8 h-20 text-center font-bold">
        Feature Model Visualizer
      </h1>
      <main className="flex ">
        <Input setInput={setInput} />
        <Output input={input} />
      </main>
      <Footer />
    </div>
  );
}

const Input = ({
  setInput,
}: {
  setInput: Dispatch<SetStateAction<string>>;
}) => {
  const placeholder = useMemo(() => getPlaceholder(), []);
  useEffect(() => {
    setInput(placeholder);
  }, [setInput, placeholder]);
  return (
    <div className="flex flex-col w-1/3 px-4">
      <textarea
        className="w-full h-[--fulloutline] resize-none text-black"
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
    </div>
  );
};

const Output = ({ input }: { input: string }) => {
  return (
    <div className="flex">
      <p>{input}</p>
    </div>
  );
};
const Footer = () => (
  <footer className="text-center p-4 h-8 grow-0">
    Created by Aleksandar Ivanov. You can find me on{" "}
    <a className="text-purple-400" href="https://github.com/Maimunar">
      GitHub
    </a>
    !
  </footer>
);
