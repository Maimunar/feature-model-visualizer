import {
  Feature,
  FeatureModel,
  FeatureModelSchema,
  getChildrenRelation,
  getParentRelation,
} from "./model";
import { getInputUpdatedXY, treeBuilder } from "./utils";
function assignCoordinates(
  root: FeatureModel,
  horizontalSpacing = 80, // Space between items
  verticalSpacing = 110,
  maxPerRow = 5,
  letterSpacing = 2,
): void {
  if (!root) return;

  type PositionedNode = { node: Feature; depth: number };
  const queue: PositionedNode[] = [{ node: root, depth: 0 }];
  const levels: Map<number, Feature[]> = new Map(); // Track nodes per depth level

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;

    if (!levels.has(depth)) levels.set(depth, []);
    levels.get(depth)!.push(node);

    if (node.children) {
      for (const child of node.children) {
        queue.push({ node: child, depth: depth + 1 });
      }
    }
  }

  let currentRow = 0;

  const rowMatrix: Map<number, Feature[]> = new Map(); // Store matrix rows

  // Convert levels into a matrix of rows
  levels.forEach((nodes) => {
    let row: Feature[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (row.length === maxPerRow) {
        rowMatrix.set(currentRow, row);
        currentRow++;
        row = [];
      }
      row.push(nodes[i]);
    }
    if (row.length > 0) {
      rowMatrix.set(currentRow, row);
      currentRow++;
    }
  });

  let x = 0;
  let y = 0;
  // Assign X & Y based only on row index
  rowMatrix.forEach((rowNodes) => {
    x = 0;
    y += verticalSpacing;
    rowNodes.forEach((node) => {
      if (node.x) {
        // @ts-expect-error box is optional
        node.box = { x: node.x, y: node.y || y };
        return;
      }
      x += horizontalSpacing / 2 + node.name.length * letterSpacing;
      // @ts-expect-error box is optional
      node.box = {
        x,
        y: node.y || y,
      };
      x += horizontalSpacing / 2 + node.name.length * letterSpacing;
    });
  });
}

export const buildTree = (input: string) => {
  let model: FeatureModel;
  try {
    const data = JSON.parse(input);
    model = FeatureModelSchema.parse(data);
  } catch (err) {
    console.log(err);
    return {
      error: "Please provide a valid Feature Model",
      model: undefined,
    };
  }

  assignCoordinates(model);
  const builder = treeBuilder();
  const callbackOnRootMove = (x: number, y: number) => {
    const newInput = getInputUpdatedXY(
      model,
      model.name,
      getParentRelation(model.parentRelation),
      getChildrenRelation(model.childrenRelation),
      x,
      y,
    );
    console.log(newInput);
  };

  const root = builder.createBox(
    model.name,
    model.box?.x || 50,
    model.box?.y || 50,
    "none",
    getChildrenRelation(model.childrenRelation),
    callbackOnRootMove,
  );

  model.box = root;

  const queue = [...model.children];

  while (queue.length > 0) {
    const levelSize = Math.min(queue.length, 5);

    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;

      const callbackOnBoxMove = (x: number, y: number) => {
        const newInput = getInputUpdatedXY(
          model,
          current.name,
          getParentRelation(current.parentRelation),
          getChildrenRelation(current.childrenRelation),
          x,
          y,
        );
        console.log(newInput);
      };

      const box = builder.createBox(
        current.name,
        current.box?.x || 50,
        current.box?.y || 50,
        getParentRelation(current.parentRelation),
        getChildrenRelation(current.childrenRelation),
        callbackOnBoxMove,
      );

      current.box = box;

      if (current.children) queue.push(...current.children);
    }
  }

  const connQueue: (Feature | FeatureModel)[] = [model];
  while (connQueue.length > 0) {
    const parent = connQueue.shift()!;
    parent.children?.forEach((child) => {
      if (!parent.box || !child.box) {
        console.log("something is wrong");
        return;
      }
      builder.connectBoxes(parent.box, child.box);
      connQueue.push(child);
    });
  }

  return {
    error: null,
    model,
  };
};
