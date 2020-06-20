import { makeStyles } from "@material-ui/core/styles";
import { makeTransition } from "../components/Transition";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import { ResourceKey } from "../resources/types";
import Category from "../resources/Category";

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
  setEquipment: StateSetter<Equipment[]>,
  setCategories: StateSetter<Category[]>,
  setTags: StateSetter<Tag[]>
): void => {
  Promise.all(resourceUrls.map((url) => fetch(url))).then((responses) =>
    Promise.all(responses.map((response) => response.json())).then(
      (dataArray) => {
        dataArray.forEach(({ data, context }) => {
          switch (+context) {
            case ResourceKey.Equipment:
              setEquipment(data.map((d: unknown) => new Equipment(d as never)));
              break;
            case ResourceKey.Categories:
              setCategories(data.map((d: unknown) => new Category(d as never)));
              break;
            case ResourceKey.Tags:
              setTags(data.map((d: unknown) => new Tag(d as never)));
              break;
            default:
              throw new Error(
                `unhandled resource fetch in equipment form with ${context}`
              );
          }
        });
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

export function quantizeEquipment(equipment: Equipment[]): Equipment[] {
  return equipment.reduce((quantized: Equipment[], item) => {
    const hasTitle = (equipment: Equipment): boolean =>
      equipment.description === item.description;
    const alreadyDone = quantized.find(hasTitle);
    if (!alreadyDone)
      quantized.push({
        ...item,
        quantity: equipment.filter(hasTitle).length,
      });
    return quantized;
  }, []);
}

// Function to convert equipment Array to Quantized equipment Array
export function buildDictionaries(
  equipment: Equipment[]
): [{ [k: string]: boolean }, { [k: string]: Set<string> }] {
  // Build selectedEquipment dictionary for Formik
  // Build Categories Dictionary
  // Build Filters Dictionary
  const filters: { [k: string]: boolean } = {};
  const categories: { [k: string]: Set<string> } = {};
  equipment.forEach((item) => {
    item.tags.forEach((tag) => {
      if (!categories[item.category.path || item.category.name]) {
        categories[item.category.path || item.category.name] = new Set();
      }
      categories[item.category.path || item.category.name].add(tag.name);
      filters[tag.name] = false;
    });
  });
  return [filters, categories];
}
