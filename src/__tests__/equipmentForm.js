import {
  queryEquipment,
  filterEquipment,
  quantizeEquipment,
  filterItems,
  makeQueryRegExp,
  makeQueryTest,
} from "../equipmentForm/equipmentForm";

// Test fixtures: TAKE CARE THAT YOU DO NOT MUTATE THESE!!
const guitar = {
  description: "electric guitar",
  quantity: 1,
  tags: [{
    title: "single-coil"
  }],
  category: {
    id: 1,
    title: "instruments",
    parentId: null
  },
};

const mic = {
  description: "condenser mic",
  quantity: 1,
  tags: [{
    title: "condenser"
  }],
  category: {
    id: 2,
    title: "microphones",
    parentId: null
  },
};

test("query with nothing returns all input", () => {
  const equipment = [guitar];
  expect(queryEquipment(equipment, "")).toEqual(equipment);
});

test("query matches description", () => {
  const equipment = [guitar];
  expect(queryEquipment(equipment, "guitar")).toEqual(equipment);
});

test("query matches category title", () => {
  const equipment = [guitar];
  expect(queryEquipment(equipment, "instruments")).toEqual(equipment);
});

test("query matches tags", () => {
  const equipment = [guitar];
  expect(queryEquipment(equipment, "single-coil")).toEqual(equipment);
});

test("filter matches tags", () => {
  const equipment = [guitar, mic];
  const filters = {
    "single-coil": true
  };
  expect(filterEquipment(equipment, filters)).toEqual([guitar]);
});

test("quantize collapses items of same description", () => {
  const equipment = [guitar, mic, guitar, mic, guitar];
  expect(quantizeEquipment(equipment).length).toBe(2);
  expect(
    quantizeEquipment(equipment).find(
      (item) => item.description === guitar.description
    ).quantity
  ).toBe(3);
});

test("quantize empty array return empty array", () => {
  expect(quantizeEquipment([])).toEqual([]);
});

//-------------------ALTERNATIVES--------------//

test("filterItems with no filter inputs returns all items", () => {
  const equipment = [guitar];
  expect(filterItems(equipment, "", {})).toEqual(equipment);
});

test("make query RegExp", () => {
  expect(makeQueryRegExp(" guitar amp ")).toEqual(/guitar|amp/gi);
});

test("make query test", () => {
  expect(makeQueryTest(" electric guitar ")(guitar)).toBe(true);
});

test("filterItems by query", () => {
  expect(filterItems([guitar, mic], "guitar", {})).toEqual([guitar]);
});

test("filterItems by tags", () => {
  expect(filterItems([guitar, mic], "", {
    "single-coil": true
  })).toEqual([
    guitar,
  ]);
});

test("filterItems by category", () => {
  expect(
    filterItems([guitar, mic], "", {}, {
      id: 1,
      title: "instruments",
      parentId: null
    })
  ).toEqual([guitar]);
});