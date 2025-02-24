import beautify from "json-beautify";
import utilsFactoryBuilder from "./treeUtils";
import {
  Box,
  Feature,
  FeatureModel,
  getChildrenRelation,
  getParentRelation,
  placeholder,
} from "./model";

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
    callbackOnMove: (x: number, y: number) => void,
  ): Box => {
    const childStyles = { mandatory: "M", optional: "O", none: "C" };
    const parentStyles = { and: "A", or: "O", xor: "X" };
    return factory.create_box(
      description,
      x,
      y,
      childStyles[childstyle],
      parentStyles[parentstyle],
      callbackOnMove,
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

//export const getInputUpdatedXY = (
//  model: FeatureModel,
//  name: string,
//  childStyle: "mandatory" | "optional" | "none",
//  parentStyle: "and" | "or" | "xor",
//  x: number,
//  y: number,
//): string => {
//  // This function takes the model and updates the x and y of the feature with the given name, parentstyle and childstyle
//  // First it finds the feature with the given name, parentstyle and childstyle from the model and its children with a bfs algorithm
//  // Then it creates a new copy of the model with the updated x and y in that position
//  const updatedModel = { ...model };
//  const queue: (Feature | FeatureModel)[] = [updatedModel];
//  let current;
//  while (queue.length > 0) {
//    current = queue.shift();
//    if (
//      current?.name === name &&
//      current.childrenRelation === parentStyle &&
//      current.parentRelation === childStyle
//    ) {
//      break;
//    }
//    if (current?.children) {
//      queue.push(...current.children);
//    }
//  }
//  if (!current) {
//    return JSON.stringify(updatedModel);
//  }
//
//  // Then it updates the model
//  current.x = x;
//  current.y = y;
//  // Then it returns a stringified version of the updated model
//  console.log(updatedModel);
//  console.log("Swag");
//
//  return JSON.stringify(updatedModel);
//};

export const getInputUpdatedXY = (
  model: FeatureModel,
  name: string,
  childStyle: "mandatory" | "optional" | "none",
  parentStyle: "and" | "or" | "xor",
  x: number,
  y: number,
): string => {
  const removeAllBoxProperties = (node: Feature | FeatureModel): void => {
    if (node.box) {
      delete node.box;
    }

    node.children?.forEach(removeAllBoxProperties);
  };
  // Helper function to recursively find the child
  const findAndUpdateChild = (node: Feature | FeatureModel): boolean => {
    if (
      node.name === name &&
      getParentRelation(node.parentRelation) === childStyle &&
      getChildrenRelation(node.childrenRelation) === parentStyle
    ) {
      node.x = x;
      node.y = y;
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (findAndUpdateChild(child)) return true;
      }
    }
    return false;
  };

  removeAllBoxProperties(model);
  const updated = findAndUpdateChild(model);
  if (!updated) console.log("Could not find the node to update");

  const output = JSON.stringify(model);

  return output;
};
