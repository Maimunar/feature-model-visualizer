import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

import { buildTree } from "./treeBuilder";
import { FeatureModel } from "./model";
import { getExcludes, getRequires } from "./utils";

export default function Output({
  input,
  setInput,
}: {
  input: FeatureModel | undefined;
  setInput: Dispatch<SetStateAction<FeatureModel | undefined>>;
}) {
  useEffect(() => {
    if (input) {
      buildTree(input, setInput);
    }
  }, [input, setInput]);

  const requires = useMemo(() => getRequires(input), [input]);
  const excludes = useMemo(() => getExcludes(input), [input]);
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
