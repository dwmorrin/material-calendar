import {
  queryEquipment,
  filterEquipment,
  quantizeEquipment,
  buildDictionaries,
} from "../utils/equipment";

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
  const equipment = [{ description: "ITEM" }, { description: "ITEM" }];
  expect(quantizeEquipment(equipment).length).toBe(1);
});

test("build dictionaries", () => {
  const testItem = {
    category: { path: "MAIN", name: "SUB" },
    tags: [{ name: "TEST" }, { name: "ITEM" }],
  };
  const equipment = [testItem];
  expect(buildDictionaries(equipment)).toEqual([
    { ITEM: false, TEST: false },
    { MAIN: new Set(["TEST", "ITEM"]) },
  ]);
});
