import Category from "../resources/Category";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";

export interface EquipmentState {
  filterDrawerIsOpen: boolean;
  searchString: string;
  equipment: Equipment[];
  tags: Tag[];
  categories: Category[];
  selectedTags: { [k: string]: boolean };
  currentCategory: Category | null;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}

export enum EquipmentActionTypes {
  ChangedSearchString,
  ReceivedResource,
  SelectedFilter,
  ToggleFilterDrawer,
}

export interface EquipmentAction {
  type: EquipmentActionTypes;
  payload: Partial<EquipmentState>;
  meta?: unknown;
}

export interface EquipmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedEquipment: {
    [k: string]: number;
  };
  setFieldValue: (field: string, value: number | string | boolean) => void;
}