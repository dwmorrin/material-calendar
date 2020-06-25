import {
  queryEquipment,
  filterEquipment,
  quantizeEquipment,
  filterItems,
  makeQueryRegExp,
  makeQueryTest,
} from "../equipmentForm/equipmentForm";

//------ TEST FIXTURES ---------//
//--- Categories
const instrumentsCategory = {
  id: 1,
  title: "instruments",
  parentId: null,
};
Object.freeze(instrumentsCategory);

const microphonesCategory = {
  id: 2,
  title: "microphones",
  parentId: null,
};
Object.freeze(microphonesCategory);

//--- Tags
const singleCoilTag = { title: "single-coil" };
Object.freeze(singleCoilTag);

const condenserTag = {
  title: "condenser",
};
Object.freeze(condenserTag);

//--- Items
const guitar = {
  description: "electric guitar",
  quantity: 1,
  tags: [singleCoilTag],
  category: instrumentsCategory,
};
Object.freeze(guitar);

const mic = {
  description: "condenser mic",
  quantity: 1,
  tags: [condenserTag],
  category: microphonesCategory,
};
Object.freeze(mic);

//--------- TESTS ----------------//

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
    "single-coil": true,
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
  expect(
    filterItems([guitar, mic], "", {
      "single-coil": true,
    })
  ).toEqual([guitar]);
});

test("filterItems by category", () => {
  expect(filterItems([guitar, mic], "", {}, instrumentsCategory)).toEqual([
    guitar,
  ]);
});
