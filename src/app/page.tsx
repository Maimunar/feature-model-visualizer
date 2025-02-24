"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FeatureModel, placeholder } from "./model";

const Output = dynamic(() => import("./Output"), { ssr: false });
const Input = dynamic(() => import("./Input"), { ssr: false });

export default function Home() {
  const [input, setInput] = useState<FeatureModel | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    setInput(placeholder);
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl p-8 h-20 text-center font-bold">
        Feature Model Visualizer
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <main className="flex">
        <Input input={input} setInput={setInput} setError={setError} />
        <Output input={input} setInput={setInput} />
      </main>
      <Footer />
    </div>
  );
}

const Footer = () => (
  <footer className="text-center p-4 h-8 grow-0">
    Created by Aleksandar Ivanov. You can find me on{" "}
    <a className="text-purple-400" href="https://github.com/Maimunar">
      GitHub
    </a>
    !
  </footer>
);
