import { EquipmentState, EquipmentAction, EquipmentActionTypes } from "./types";
import Category from "../resources/Category";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";

export const initialState = {
  filterDrawerIsOpen: false,
  searchString: "",
  equipment: [] as Equipment[],
  tags: [] as Tag[],
  categories: [] as Category[],
  filters: {} as { [k: string]: boolean },
  currentCategory: "",
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

const toggleFilterDrawer: StateHandler = (state) => ({
  ...state,
  filterDrawerIsOpen: !state.filterDrawerIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [EquipmentActionTypes.ChangedSearchString]: changedSearchString,
    [EquipmentActionTypes.ReceivedResource]: receivedResource,
    [EquipmentActionTypes.ToggleFilterDrawer]: toggleFilterDrawer,
  }[action.type](state, action));

export default reducer;
