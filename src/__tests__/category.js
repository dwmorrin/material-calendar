import Category from "../resources/Category";

const categories = [
  { id: 1, title: "drums", parentId: 18 },
  { id: 2, title: "accessory", parentId: 19 },
  { id: 4, title: "bass", parentId: 19 },
  { id: 5, title: "guitar", parentId: 19 },
  { id: 6, title: "accessory", parentId: 20 },
  { id: 7, title: "controllers", parentId: 20 },
  { id: 8, title: "drum machines", parentId: 20 },
  { id: 9, title: "drums", parentId: 20 },
  { id: 10, title: "expression", parentId: 20 },
  { id: 11, title: "interface", parentId: 20 },
  { id: 12, title: "accessory", parentId: 21 },
  { id: 13, title: "condenser", parentId: 21 },
  { id: 14, title: "dynamic", parentId: 21 },
  { id: 15, title: "ribbon", parentId: 21 },
  { id: 16, title: "tube", parentId: 21 },
  { id: 17, title: "accessory", parentId: 22 },
  { id: 18, title: "accessories", parentId: null },
  { id: 19, title: "amplifiers", parentId: null },
  { id: 20, title: "instruments and controllers", parentId: null },
  { id: 21, title: "microphones", parentId: null },
  { id: 22, title: "monitoring", parentId: null },
  { id: 23, title: "guitar", parentId: 20 },
  { id: 24, title: "electric", parentId: 23 },
  { id: 25, title: "acoustic", parentId: 23 },
];

const categoryTrees = [
  {
    id: 18,
    title: "accessories",
    parentId: null,
    children: [{ id: 1, title: "drums", parentId: 18, children: [] }],
  },
  {
    id: 19,
    title: "amplifiers",
    parentId: null,
    children: [
      { id: 2, title: "accessory", parentId: 19, children: [] },
      { id: 4, title: "bass", parentId: 19, children: [] },
      { id: 5, title: "guitar", parentId: 19, children: [] },
    ],
  },
  {
    id: 20,
    title: "instruments and controllers",
    parentId: null,
    children: [
      { id: 6, title: "accessory", parentId: 20, children: [] },
      { id: 7, title: "controllers", parentId: 20, children: [] },
      { id: 8, title: "drum machines", parentId: 20, children: [] },
      { id: 9, title: "drums", parentId: 20, children: [] },
      { id: 10, title: "expression", parentId: 20, children: [] },
      { id: 11, title: "interface", parentId: 20, children: [] },
      {
        id: 23,
        title: "guitar",
        parentId: 20,
        children: [
          { id: 24, title: "electric", parentId: 23, children: [] },
          { id: 25, title: "acoustic", parentId: 23, children: [] },
        ],
      },
    ],
  },
  {
    id: 21,
    title: "microphones",
    parentId: null,
    children: [
      { id: 12, title: "accessory", parentId: 21, children: [] },
      { id: 13, title: "condenser", parentId: 21, children: [] },
      { id: 14, title: "dynamic", parentId: 21, children: [] },
      { id: 15, title: "ribbon", parentId: 21, children: [] },
      { id: 16, title: "tube", parentId: 21, children: [] },
    ],
  },
  {
    id: 22,
    title: "monitoring",
    parentId: null,
    children: [{ id: 17, title: "accessory", parentId: 22, children: [] }],
  },
];

test("tree", () => {
  expect(Category.tree(categories)).toEqual(categoryTrees);
});

test("path", () => {
  expect(
    Category.path(categories, { id: 24, title: "electric", parentId: 23 })
  ).toEqual("instruments and controllers > guitar > electric");
});
