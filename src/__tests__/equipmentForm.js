import {
  queryEquipment,
  filterEquipment,
  quantizeEquipment,
  filterItems,
  makeQueryRegExp,
  makeQueryTest,
} from "../calendar/equipmentForm";

test("query with nothing returns all input", () => {
  const testItem = {
    description: "TEST ITEM",
    category: { path: "", name: "" },
    tags: [],
  };
  const equipment = [testItem];
  expect(queryEquipment(equipment, "")).toEqual(equipment);
});

test("query matches description", () => {
  const testItem = {
    description: "TEST ITEM",
    category: { path: "", name: "" },
    tags: [],
  };
  const equipment = [testItem];
  expect(queryEquipment(equipment, "test")).toEqual(equipment);
});

test("query matches category path", () => {
  const testItem = {
    description: "",
    category: { path: "TEST ITEM", name: "" },
    tags: [],
  };
  const equipment = [testItem];
  expect(queryEquipment(equipment, "test")).toEqual(equipment);
});

test("query matches category name", () => {
  const testItem = {
    description: "",
    category: { path: "", name: "TEST ITEM" },
    tags: [],
  };
  const equipment = [testItem];
  expect(queryEquipment(equipment, "test")).toEqual(equipment);
});

test("query matches tags", () => {
  const testItem = {
    description: "",
    category: { path: "", name: "" },
    tags: [{ name: "TEST" }, { name: "ITEM" }],
  };
  const equipment = [testItem];
  expect(queryEquipment(equipment, "test")).toEqual(equipment);
});

test("filter matches tags", () => {
  const testItem = {
    description: "",
    category: { path: "", name: "" },
    tags: [{ name: "TEST" }, { name: "ITEM" }],
  };
  const equipment = [testItem];
  const filters = { test: true };
  expect(filterEquipment(equipment, filters)).toEqual(equipment);
});

test("quantize collapses items of same description", () => {
  const equipment = [
    { description: "ITEM", quantity: 1 },
    { description: "TEST", quantity: 1 },
    { description: "ITEM", quantity: 1 },
    { description: "TEST", quantity: 1 },
    { description: "ITEM", quantity: 1 },
  ];
  expect(quantizeEquipment(equipment).length).toBe(2);
  expect(quantizeEquipment(equipment)[0].quantity).toBe(3);
});

//---------------------------------------------//

test("filterItems with no filter inputs returns all items", () => {
  const equipment = [
    {
      description: "guitar",
      quantity: 1,
      tags: [{ name: "guitar" }],
      category: { name: "intruments" },
    },
  ];
  expect(filterItems(equipment, "", [])).toEqual(equipment);
});

test("make query RegExp", () => {
  expect(makeQueryRegExp(" guitar amp ")).toEqual(/guitar|amp/gi);
});

test("make query test", () => {
  const item = {
    description: "electric guitar",
    quantity: 1,
    tags: [{ name: "guitar" }],
    category: { name: "intruments", path: "" },
  };
  expect(makeQueryTest(" electric guitar ")(item)).toBeTruthy();
});

test("filterItems by query", () => {
  const equipment = [
    {
      description: "electric guitar",
      quantity: 1,
      tags: [{ name: "guitar" }],
      category: { name: "intruments", path: "" },
    },
  ];
  expect(filterItems(equipment, "guitar", [])).toEqual(equipment);
});
