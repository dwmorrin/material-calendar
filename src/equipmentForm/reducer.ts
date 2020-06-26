import { EquipmentState, EquipmentAction, EquipmentActionTypes } from "./types";
import Category from "../resources/Category";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";

export const initialState = {
  filterDrawerIsOpen: false,
  equipmentCartIsOpen: false,
  categoryDrawerView: false,
  searchString: "",
  equipment: [] as Equipment[],
  tags: [] as Tag[],
  categories: [] as Category[],
  selectedTags: {} as { [k: string]: boolean },
  currentCategory: null,
  viewedCategory: null,
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

const selectedCategory: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
});

const viewedCategory: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
});

const toggleFilterDrawer: StateHandler = (state) => ({
  ...state,
  filterDrawerIsOpen: !state.filterDrawerIsOpen,
});

const toggleEquipmentViewMode: StateHandler = (state) => ({
  ...state,
  categoryDrawerView: !state.categoryDrawerView,
});

const toggleEquipmentCart: StateHandler = (state) => ({
  ...state,
  equipmentCartIsOpen: !state.equipmentCartIsOpen,
});
const reducer: StateHandler = (state, action) =>
  ({
    [EquipmentActionTypes.ChangedSearchString]: changedSearchString,
    [EquipmentActionTypes.ReceivedResource]: receivedResource,
    [EquipmentActionTypes.SelectedCategory]: selectedCategory,
    [EquipmentActionTypes.ViewedCategory]: viewedCategory,
    [EquipmentActionTypes.SelectedFilter]: selectedFilter,
    [EquipmentActionTypes.ToggleFilterDrawer]: toggleFilterDrawer,
    [EquipmentActionTypes.ToggleEquipmentViewMode]: toggleEquipmentViewMode,
    [EquipmentActionTypes.ToggleEquipmentCart]: toggleEquipmentCart,
  }[action.type](state, action));

export default reducer;
