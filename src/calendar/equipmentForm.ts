import { makeStyles } from "@material-ui/core/styles";
import { makeTransition } from "../components/Transition";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import { ResourceKey } from "../resources/types";
import Category from "../resources/Category";
import {
  EquipmentAction,
  EquipmentState,
  EquipmentActionTypes,
} from "../equipmentForm/types";

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
type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
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
                (d: unknown) => new Equipment(d as never)
              );
              break;
            case ResourceKey.Categories:
              payload.categories = data.map(
                (d: unknown) => new Category(d as never)
              );
              break;
            case ResourceKey.Tags:
              payload.tags = data.map((d: unknown) => new Tag(d as never));
                payload.selectedTags = payload.tags?.reduce(
                (filters, tag) => ({
                  ...filters,
                  [tag.name]: false,
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

export const makeValidTags = (tags: Tag[], currentCategory: string): string[] =>
  tags
    .filter(
      (tag) =>
        tag.category.name === currentCategory ||
        tag.category.path === currentCategory
    )
    .map((tag) => tag.name)
    .filter((v, i, a) => a.indexOf(v) === i);

export const makeToggleFilterDrawer = (
  currentState: boolean,
  setFilterDrawerIsOpen: StateSetter<boolean>
) => (event?: React.KeyboardEvent | React.MouseEvent): void => {
  if (
    event?.type === "keydown" &&
    ((event as React.KeyboardEvent).key === "Tab" ||
      (event as React.KeyboardEvent).key === "Shift")
  ) {
    return;
  }
  setFilterDrawerIsOpen(!currentState);
};

export function queryEquipment(
  equipment: Equipment[],
  searchString: string
): Equipment[] {
  if (!searchString) {
    return equipment;
  }
  const queries = searchString.trim().toLowerCase().split(/\W+/);
  return equipment.filter((equipment) =>
    queries.every(
      (query) =>
        equipment.description.toLowerCase().includes(query) ||
        equipment.category.path ||
        equipment.category.name.toLowerCase().includes(query) ||
        equipment.tags.some((tag) => tag.name.toLowerCase().includes(query))
    )
  );
}

// Filtering Function to reduce the size of the equipment array being passed down
export function filterEquipment(
  equipment: Equipment[],
  filters: { [k: string]: boolean }
): Equipment[] | undefined {
  const activeFilters = Object.keys(filters)
    .filter((key) => filters[key])
    .map((key) => key.trim().toLowerCase());
  return equipment.filter((item) =>
    activeFilters.every((filter) =>
      item.tags.some((tag) => tag.name.toLowerCase().includes(filter))
    )
  );
}

const last = (array: Equipment[]): Equipment => array[array.length - 1];
const byDescription = (a: Equipment, b: Equipment): number =>
  a.description < b.description ? -1 : a.description > b.description ? 1 : 0;
const copyAndSortByDescription = (array: Equipment[]): Equipment[] => {
  const copy = array.slice();
  copy.sort(byDescription);
  return copy;
};

export function quantizeEquipment(equipment: Equipment[]): Equipment[] {
  const toBeQuantized = copyAndSortByDescription(equipment);
  const quantized = [{ ...toBeQuantized[0] }];
  for (let i = 1; i < toBeQuantized.length; ++i) {
    if (toBeQuantized[i].description === last(quantized).description) {
      last(quantized).quantity += toBeQuantized[i].quantity;
    } else {
      quantized.push({ ...toBeQuantized[i] });
    }
  }
  return quantized;
}

//---------------------------------------//
type ItemTest = (item: Equipment) => boolean;

const lowerCaseAndTrimEquipment = (e: Equipment): Equipment => ({
  ...e,
  category: { ...e.category, name: e.category.name.trim().toLowerCase() },
  description: e.description.trim().toLowerCase(),
  tags: e.tags.map((t) => ({ ...t, name: t.name.trim().toLowerCase() })),
});

export const makeQueryRegExp = (query: string): RegExp =>
  new RegExp(query.trim().replace(/\W+/g, "|"), "ig");

const isTruthy: ItemTest = (item) => !!item;

// match all tokens
export const makeQueryTest = (query: string): ItemTest => {
  if (!query) return isTruthy;
  const tokenize = (s: string): string[] => s.trim().split(/\W+/);
  const numberOfTokens = tokenize(query).length;
  const queryRegExp = makeQueryRegExp(query);
  return ({ description, category, tags }: Equipment): boolean => {
    const strings = [
      ...tokenize(description),
      ...tokenize(category.name),
      ...tokenize(category.path),
      ...tags.map((t) => t.name),
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

// TODO consider name & path
const makeCategoryTest = (category?: Category): ItemTest =>
  !category
    ? isTruthy
    : (item: Equipment): boolean => item.category.name === category.name;

const makeTagsTest = (tags: Tag[]): ItemTest =>
  !tags.length
    ? isTruthy
    : (item: Equipment): boolean =>
        tags.every((tag) => item.tags.some(({ name }) => tag.name === name));

const makeItemTest = (
  query: string,
  tags: Tag[],
  category?: Category
): ItemTest => {
  const tests = [
    makeCategoryTest(category),
    makeTagsTest(tags),
    makeQueryTest(query),
  ];
  return (item: Equipment): boolean => {
    const itemUnderTest = lowerCaseAndTrimEquipment(item);
    return tests.every((test) => test(itemUnderTest));
  };
};

export const filterItems = (
  equipment: Equipment[],
  query: string,
  tags: Tag[],
  category?: Category
): Equipment[] => equipment.filter(makeItemTest(query, tags, category));
