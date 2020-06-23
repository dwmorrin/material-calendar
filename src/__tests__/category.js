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
    children: [{ id: 1, title: "drums", children: [] }],
  },
  {
    id: 19,
    title: "amplifiers",
    children: [
      { id: 2, title: "accessory", children: [] },
      { id: 4, title: "bass", children: [] },
      { id: 5, title: "guitar", children: [] },
    ],
  },
  {
    id: 20,
    title: "instruments and controllers",
    children: [
      { id: 6, title: "accessory", children: [] },
      { id: 7, title: "controllers", children: [] },
      { id: 8, title: "drum machines", children: [] },
      { id: 9, title: "drums", children: [] },
      { id: 10, title: "expression", children: [] },
      { id: 11, title: "interface", children: [] },
      {
        id: 23,
        title: "guitar",
        children: [
          { id: 24, title: "electric", children: [] },
          { id: 25, title: "acoustic", children: [] },
        ],
      },
    ],
  },
  {
    id: 21,
    title: "microphones",
    children: [
      { id: 12, title: "accessory", children: [] },
      { id: 13, title: "condenser", children: [] },
      { id: 14, title: "dynamic", children: [] },
      { id: 15, title: "ribbon", children: [] },
      { id: 16, title: "tube", children: [] },
    ],
  },
  {
    id: 22,
    title: "monitoring",
    children: [{ id: 17, title: "accessory", children: [] }],
  },
];

test("tree", () => {
  expect(Category.tree(categories)).toEqual(categoryTrees);
});
