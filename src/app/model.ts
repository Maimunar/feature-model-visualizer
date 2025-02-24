"use client";
import { z } from "zod";

const BoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  g: z.any(),
  t: z.any(),
  r: z.any(),
  c: z.any(),
  p: z.any(),
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
  x: z.number().optional(),
  y: z.number().optional(),
  box: BoxSchema.optional(),
});

export type Feature = z.infer<typeof BaseFeatureSchema> & {
  children?: Feature[];
};

export const FeatureSchema: z.ZodType<Feature> = BaseFeatureSchema.extend({
  children: z.lazy(() => FeatureSchema.array()).optional(),
});

export const FeatureModelSchema = BaseFeatureSchema.extend({
  children: z.array(FeatureSchema),
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
        {
          name: "Offers",
          x: 46,
          y: 224,
        },
        {
          name: "Info",
          parentRelation: "mandatory",
          childrenRelation: "or",
          children: [
            {
              name: "Image",
              x: 43,
              y: 440,
            },
            {
              name: "Description",
              x: 88,
              y: 506,
            },
            {
              name: "Price",
              x: 148,
              y: 437,
            },
          ],
          x: 71,
          y: 323,
        },
        {
          name: "Search",
          childrenRelation: "or",
          children: [
            {
              name: "Basic",
              x: 202,
              y: 497,
            },
            {
              name: "Advanced",
              x: 312,
              y: 496,
            },
          ],
          x: 198,
          y: 390,
        },
      ],
      x: 60,
      y: 140,
    },
    {
      name: "Payment",
      parentRelation: "mandatory",
      childrenRelation: "or",
      children: [
        {
          name: "Bank Draft",
          x: 166,
          y: 224,
        },
        {
          name: "Credit Card",
          childrenRelation: "or",
          children: [
            {
              name: "Visa",
              x: 279,
              y: 396,
            },
            {
              name: "American Express",
              x: 417,
              y: 397,
            },
          ],
          x: 324,
          y: 324,
        },
      ],
      x: 172,
      y: 142,
    },
    {
      name: "Security",
      childrenRelation: "xor",
      children: [
        {
          name: "High",
          x: 238,
          y: 275,
        },
        {
          name: "Medium",
          x: 339,
          y: 268,
        },
      ],
      x: 285,
      y: 145,
    },
    {
      name: "GUI",
      parentRelation: "mandatory",
      childrenRelation: "or",
      children: [
        {
          name: "PC",
          x: 361,
          y: 218,
        },
        {
          name: "Mobile",
          x: 447,
          y: 213,
        },
      ],
      x: 381,
      y: 144,
    },
    {
      name: "Banners",
      x: 462,
      y: 138,
    },
  ],
  requires: [["E-Shop.Payment.Credit Card", "E-Shop.Security.High"]],
  excludes: [["E-Shop.GUI.Mobile", "E-Shop.Banners"]],
  x: 271,
  y: 58,
};
export const placeholderNoPositions: FeatureModel = {
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

export const smallPlaceholder: FeatureModel = {
  name: "E-Shop",
  children: [
    {
      name: "Catalogue",
      parentRelation: "mandatory",
    },
    {
      name: "Security",
    },
  ],
};

export const getParentRelation = (relation: Feature["parentRelation"]) =>
  relation ?? "none";
export const getChildrenRelation = (relation: Feature["childrenRelation"]) =>
  relation ?? "and";
