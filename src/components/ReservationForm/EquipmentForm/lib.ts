import { makeStyles } from "@material-ui/core/styles";
import { makeTransition } from "../../Transition";
import Equipment from "../../../resources/Equipment";
import Category from "../../../resources/Category";

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
