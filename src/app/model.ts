import { z } from "zod";

const BoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  g: z.instanceof(SVGGElement),
  t: z.instanceof(SVGTextElement),
  r: z.instanceof(SVGRectElement),
  c: z.instanceof(SVGCircleElement),
  p: z.instanceof(SVGPathElement),
  conns: z.array(z.object({ box1: z.any(), box2: z.any() })),
  childstyle: z.enum(["mandatory", "optional", "none"]),
  parentstyle: z.enum(["and", "or", "xor"]),
});

export type Box = z.infer<typeof BoxSchema>;
const ChildrenRelationSchema = z.enum(["and", "or", "xor"]);
const ParentRelationSchema = z.enum(["mandatory", "optional", "none"]);

const BaseFeatureSchema = z.object({
  name: z.string(),
  parentRelation: ParentRelationSchema.optional(),
  childrenRelation: ChildrenRelationSchema.optional(),
  box: BoxSchema.optional(),
});

export type Feature = z.infer<typeof BaseFeatureSchema> & {
  children?: Feature[];
};

export const FeatureSchema: z.ZodType<Feature> = BaseFeatureSchema.extend({
  children: z.lazy(() => FeatureSchema.array()).optional(),
});

export const FeatureModelSchema = z.object({
  name: z.string(),
  children: z.array(FeatureSchema),
  childrenRelation: ChildrenRelationSchema.optional(),
  box: BoxSchema.optional(),
  requires: z.array(z.array(z.string())).optional(),
  excludes: z.array(z.array(z.string())).optional(),
});

export type FeatureModel = z.infer<typeof FeatureModelSchema>;

export const placeholder: FeatureModel = {
  name: "E-Shop",
  children: [
    {
      name: "Catalogue",
      parentRelation: "mandatory",
      children: [
        { name: "Offers" },
        {
          name: "Info",
          parentRelation: "mandatory",
          childrenRelation: "or",
          children: [
            { name: "Image" },
            { name: "Description" },
            { name: "Price" },
          ],
        },
        {
          name: "Search",
          childrenRelation: "or",
          children: [{ name: "Basic" }, { name: "Advanced" }],
        },
      ],
    },
    {
      name: "Payment",
      parentRelation: "mandatory",
      childrenRelation: "or",
      children: [
        { name: "Bank Draft" },
        {
          name: "Credit Card",
          childrenRelation: "or",
          children: [{ name: "Visa" }, { name: "American Express" }],
        },
      ],
    },
    {
      name: "Security",
      childrenRelation: "xor",
      children: [{ name: "High" }, { name: "Medium" }],
    },
    {
      name: "GUI",
      parentRelation: "mandatory",
      childrenRelation: "or",
      children: [{ name: "PC" }, { name: "Mobile" }],
    },
    {
      name: "Banners",
    },
  ],
  requires: [["E-Shop.Payment.Credit Card", "E-Shop.Security.High"]],
  excludes: [["E-Shop.GUI.Mobile", "E-Shop.Banners"]],
};

export const getParentRelation = (relation: Feature["parentRelation"]) =>
  relation ?? "none";
export const getChildrenRelation = (relation: Feature["childrenRelation"]) =>
  relation ?? "and";
