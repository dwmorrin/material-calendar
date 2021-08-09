import {
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
