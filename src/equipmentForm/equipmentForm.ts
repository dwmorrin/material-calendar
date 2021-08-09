import { makeStyles } from "@material-ui/core/styles";
import { makeTransition } from "../components/Transition";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import { ResourceKey } from "../resources/types";
import Category from "../resources/Category";
import { EquipmentAction, EquipmentState, EquipmentActionTypes } from "./types";

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
    textAlign: "center",
    fontSize: "18px",
  },
}));

export const transition = makeTransition("up");

const resourceUrls = [
  `${Equipment.url}?context=${ResourceKey.Equipment}`,
  `${Category.url}?context=${ResourceKey.Categories}`,
  `${Tag.url}?context=${ResourceKey.Tags}`,
];

export const fetchAllEquipmentResources = (
  dispatch: (action: EquipmentAction) => void
): void => {
  Promise.all(resourceUrls.map((url) => fetch(url))).then((responses) =>
    Promise.all(responses.map((response) => response.json())).then(
      (dataArray) => {
        const payload = dataArray.reduce(
          (payload: Partial<EquipmentState>, { data, context }) => {
            switch (+context) {
              case ResourceKey.Equipment:
                payload.equipment = data.map(
                  (e: Equipment) => new Equipment(e)
                );
                break;
              case ResourceKey.Categories:
                payload.categories = data.map((c: Category) => new Category(c));
                break;
              case ResourceKey.Tags:
                payload.tags = data.map((t: Tag) => new Tag(t));
                payload.selectedTags = payload.tags?.reduce(
                  (filters, tag) => ({
                    ...filters,
                    [tag.title]: false,
                  }),
                  {}
                );
                break;
              default:
                throw new Error(
                  `unhandled resource fetch in equipment form with ${context}`
                );
            }
            return payload;
          },
          {} as Partial<EquipmentState>
        );
        dispatch({ type: EquipmentActionTypes.ReceivedResource, payload });
      }
    )
  );
};

const last = (array: Equipment[]): Equipment => array[array.length - 1];
const byDescription = (a: Equipment, b: Equipment): number =>
  a.description < b.description ? -1 : a.description > b.description ? 1 : 0;
const copyAndSortByDescription = (array: Equipment[]): Equipment[] => {
  const copy = array.slice();
  copy.sort(byDescription);
  return copy;
};

const byManufacturerAndModel = (
  { manufacturer: makeA, model: modelA }: Equipment,
  { manufacturer: makeB, model: modelB }: Equipment
): number =>
  makeA + " " + modelA < makeB + " " + modelB
    ? -1
    : makeA + " " + modelA < makeB + " " + modelB
    ? 1
    : 0;
const copyAndSortByManufacturerAndModel = (array: Equipment[]): Equipment[] => {
  const copy = array.slice();
  copy.sort(byManufacturerAndModel);
  return copy;
};

export function quantizeEquipment(equipment: Equipment[]): Equipment[] {
  if (!equipment.length) return [];
  const toBeQuantized = copyAndSortByManufacturerAndModel(
    copyAndSortByDescription(equipment)
  );
  const quantized = [{ ...toBeQuantized[0] }];
  for (let i = 1; i < toBeQuantized.length; ++i) {
    if (
      toBeQuantized[i].manufacturer && toBeQuantized[i].model
        ? toBeQuantized[i].manufacturer + " " + toBeQuantized[i].model ===
          last(quantized).manufacturer + " " + last(quantized).model
        : toBeQuantized[i].description === last(quantized).description
    ) {
      last(quantized).quantity += toBeQuantized[i].quantity;
    } else {
      quantized.push({ ...toBeQuantized[i] });
    }
  }
  return quantized;
}

//---------------------------------------//
type ItemTest = (item: Equipment) => boolean;
type SelectedDictionary = { [k: string]: boolean };

const makeTestableItem = (e: Equipment): Equipment => ({
  ...e,
  manufacturer: e.manufacturer ? e.manufacturer.trim().toLowerCase() : "",
  model: e.model ? e.model.trim().toLowerCase() : "",
  category: {
    ...e.category,
    title: e.category.title.trim().toLowerCase(),
  },
  description: e.description.trim().toLowerCase(),
  tags: e.tags.map((t) => ({ ...t, name: t.title.trim().toLowerCase() })),
});

export const makeQueryRegExp = (query: string): RegExp =>
  new RegExp(query.trim().replace(/\W+/g, "|"), "ig");

const isTruthy: ItemTest = (item) => !!item;

// match all tokens
export const makeQueryTest = (query: string): ItemTest => {
  if (!query) return isTruthy;
  const tokenize = (s?: string): string[] => (s ? s.trim().split(/\W+/) : []);
  const numberOfTokens = tokenize(query).length;
  const queryRegExp = makeQueryRegExp(query);
  return ({ description, manufacturer, model, tags }: Equipment): boolean => {
    const strings = [
      ...tokenize(description),
      ...tokenize(manufacturer),
      ...tokenize(model),
      ...tags.map((t) => t.title),
    ];
    strings.sort();
    const distinct = strings.reduce(
      (unique, string) =>
        unique.includes(string) || !string ? unique : [...unique, string],
      [] as string[]
    );
    const matches = [...distinct.join(" ").matchAll(queryRegExp)];
    return numberOfTokens === matches.length;
  };
};

const makeCategoryTest = (category: Category | null): ItemTest =>
  !category
    ? isTruthy
    : (item: Equipment): boolean =>
        Category.existsOnCategoryOrChildren(category, item);

const getSelectedKeys = (dictionary: SelectedDictionary): string[] =>
  Object.keys(dictionary).filter((key) => dictionary[key]);

const makeTagsTest = (tags: SelectedDictionary): ItemTest => {
  const selectedTags = getSelectedKeys(tags);
  return !selectedTags.length
    ? isTruthy
    : (item: Equipment): boolean =>
        selectedTags.every((tag) =>
          item.tags.some(({ title }) => tag === title)
        );
};

const makeItemTest = (
  query: string,
  tags: SelectedDictionary,
  category: Category | null
): ItemTest => {
  const tests = [
    makeCategoryTest(category),
    makeTagsTest(tags),
    makeQueryTest(query),
  ];
  return (item: Equipment): boolean => {
    const itemUnderTest = makeTestableItem(item);
    return tests.every((test) => test(itemUnderTest));
  };
};

export const filterItems = (
  equipment: Equipment[],
  query: string,
  tags: SelectedDictionary,
  category: Category | null
): Equipment[] => equipment.filter(makeItemTest(query, tags, category));
