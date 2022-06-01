import { EquipmentState, EquipmentAction, EquipmentActionTypes } from "./types";
import Category from "../../../resources/Category";
import Tag from "../../../resources/Tag";

export const initialState = {
  filterDrawerIsOpen: false,
  equipmentCartIsOpen: false,
  // categoryDrawerView: false,
  searchString: "",
  tags: [] as Tag[],
  categories: [] as Category[],
  selectedTags: {} as { [k: string]: boolean },
  selectedCategory: null,
  categoryPath: [],
};

type StateHandler = (
  state: EquipmentState,
  action: EquipmentAction
) => EquipmentState;

const changedSearchString: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
});

const receivedResource: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
});

const selectedFilter: StateHandler = (state, { payload }) => ({
  ...state,
  selectedTags: {
    ...state.selectedTags,
    ...payload.selectedTags,
  },
});

//this should take an index, not an id
const returnToId = (categoryPath: Category[], id: number): Category[] => {
  const index = categoryPath.findIndex((cat) => cat.id === id);
  if (index >= 0) {
    categoryPath.length = index;
  }
  return categoryPath;
};

const handleCategory = (
  state: EquipmentState,
  payload: Partial<EquipmentState>
): Category[] => {
  let array = state.categoryPath;
  if (!payload.selectedCategory) {
    return array;
  }
  const newCategory = payload.selectedCategory;

  //this is a new category
  if (!array.find((entry) => entry.parentId === newCategory.parentId)) {
    array.push(newCategory);
  } else {
    //if the entry already exists in the array, rewind to it
    if (array.find((entry) => entry.id === newCategory.id)) {
      array = returnToId(array, newCategory.id);
    }
    // if the parentids match, this is a sibling and is no longer part of the path
    else if (array.find((entry) => entry.parentId === newCategory.parentId)) {
      array = returnToId(
        array,
        array.find((entry) => entry.parentId === newCategory.parentId)?.id || 0
      );
      array.push(newCategory);
    }
  }
  return array;
};

const selectCategory: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  previousCategory: handleCategory(state, payload),
});

const selectLastCategory: StateHandler = (state) => ({
  ...state,
  previousCategory: returnToId(
    state.categoryPath,
    state.selectedCategory?.id || 0
  ),
  selectedCategory: null,
});

const viewCategory: StateHandler = (state, { payload }) => ({
  ...state,
  previousCategory: handleCategory(state, payload),
});

const toggleFilterDrawer: StateHandler = (state) => ({
  ...state,
  filterDrawerIsOpen: !state.filterDrawerIsOpen,
});

const toggleEquipmentCart: StateHandler = (state) => ({
  ...state,
  equipmentCartIsOpen: !state.equipmentCartIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [EquipmentActionTypes.ChangedSearchString]: changedSearchString,
    [EquipmentActionTypes.ReceivedResource]: receivedResource,
    [EquipmentActionTypes.SelectCategory]: selectCategory,
    [EquipmentActionTypes.SelectLastCategory]: selectLastCategory,
    [EquipmentActionTypes.ViewCategory]: viewCategory,
    [EquipmentActionTypes.SelectedFilter]: selectedFilter,
    [EquipmentActionTypes.ToggleFilterDrawer]: toggleFilterDrawer,
    [EquipmentActionTypes.ToggleEquipmentCart]: toggleEquipmentCart,
  }[action.type](state, action));

export default reducer;
