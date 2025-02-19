import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { buildTree } from "./treeBuilder";
import { FeatureModel } from "./model";
import { getExcludes, getRequires } from "./utils";

export default function Output({
  input,
  setError,
}: {
  input: string;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}) {
  const [model, setModel] = useState<FeatureModel | undefined>(undefined);
  useEffect(() => {
    if (input) {
      const { error, model } = buildTree(input);
      setError(error || "");
      setModel(model);
    }
  }, [input, setError]);

  const requires = useMemo(() => getRequires(model), [model]);
  const excludes = useMemo(() => getExcludes(model), [model]);
  return (
    <div className="w-2/3 flex bg-gray-200 p-8 mr-8 rounded flex-col">
      <div className="flex gap-8">
        <textarea
          className="w-1/2 h-40 rounded resize-none text-gray-600 p-4"
          readOnly
          value={requires}
        ></textarea>
        <textarea
          className="w-1/2 h-40 rounded resize-none text-gray-600 p-4"
          readOnly
          value={excludes}
        ></textarea>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" id="model"></svg>
    </div>
  );
}
