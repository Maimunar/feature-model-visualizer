import beautify from "json-beautify";
import utilsFactoryBuilder from "./treeUtils";
import { Box, FeatureModel, placeholder } from "./model";

//@ts-expect-error aaa
export const beautifyText = (text: object) => beautify(text, null, 2, 80);

export const getPlaceholder = () => beautifyText(placeholder);

// Simple typed service of the js treeutils functions
export const treeBuilder = () => {
  const factory = utilsFactoryBuilder();

  /** Use to create a box in the visualizer */
  const createBox = (
    description: string,
    x: number,
    y: number,
    childstyle: "mandatory" | "optional" | "none",
    parentstyle: "and" | "or" | "xor",
  ): Box => {
    const childStyles = { mandatory: "M", optional: "O", none: "C" };
    const parentStyles = { and: "A", or: "O", xor: "X" };
    return factory.create_box(
      description,
      x,
      y,
      childStyles[childstyle],
      parentStyles[parentstyle],
    );
  };

  /** Use to connect two boxes in the visualizer */
  const connectBoxes = (box1: Box, box2: Box) => {
    return factory.box_connect_toggle(box1, box2);
  };

  return {
    createBox,
    connectBoxes,
  };
};

export const getRequires = (model?: FeatureModel) => {
  let s = "Requirements: \n";
  model?.requires?.forEach((req) => {
    s += req.join(" => ") + "\n";
  });
  return s;
};

export const getExcludes = (model?: FeatureModel) => {
  let s = "Excludes: \n";
  model?.excludes?.forEach((req) => {
    s += req.join(" <=> ") + "\n";
  });
  return s;
};
