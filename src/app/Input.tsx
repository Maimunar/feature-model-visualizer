import { Dispatch, SetStateAction } from "react";
import { FeatureModel, FeatureModelSchema } from "./model";
import { JsonData, JsonEditor } from "json-edit-react";

export default function Input({
  input,
  setInput,
  setError,
}: {
  input: FeatureModel | undefined;
  setInput: Dispatch<SetStateAction<FeatureModel | undefined>>;
  setError: Dispatch<SetStateAction<string>>;
}) {
  const handleJSONChange = (jsonData: JsonData) => {
    const { data, success } = FeatureModelSchema.safeParse(jsonData);
    if (success) {
      setInput(data);
    } else {
      setError("Invalid Feature Model");
    }
  };

  if (!input) return null;

  return (
    <div className="w-1/3 px-4">
      <JsonEditor data={input} setData={handleJSONChange} restrictAdd />
    </div>
  );
}
