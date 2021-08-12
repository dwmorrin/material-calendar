import Category from "../../../resources/Category";
import Tag from "../../../resources/Tag";
import Event from "../../../resources/Event";
import { EquipmentTable, EquipmentValue } from "../../../resources/Equipment";

type EquipmentFormValue = string | number | boolean | EquipmentValue;
export interface EquipmentState {
  filterDrawerIsOpen: boolean;
  equipmentCartIsOpen: boolean;
  categoryDrawerView: boolean;
  searchString: string;
  tags: Tag[];
  selectedTags: Record<string, boolean>;
  selectedCategory: Category | null;
  categoryPath: Category[];
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
}

export enum EquipmentActionTypes {
  ChangedSearchString,
  ReceivedResource,
  SelectCategory,
  SelectLastCategory,
  ViewCategory,
  SelectedFilter,
  ToggleFilterDrawer,
  ToggleEquipmentCart,
  ToggleEquipmentViewMode,
}

export interface EquipmentAction {
  type: EquipmentActionTypes;
  payload: Partial<EquipmentState>;
  meta?: unknown;
}

export interface EquipmentFormProps {
  categories: Category[];
  equipment: EquipmentTable;
  event: Event;
  open: boolean;
  selectedEquipment: EquipmentTable;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
  setOpen: (open: boolean) => void;
}

export interface EquipmentCartProps {
  state: EquipmentState;
  onClose: () => void;
  onOpen: () => void;
  selectedEquipment: EquipmentTable;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
}

export interface EquipmentItemProps {
  item: EquipmentValue;
  name: string;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
  userRestriction: number;
}

export interface EquipmentStandardListProps {
  equipment: EquipmentTable;
  selectedEquipment: EquipmentTable;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
  userRestriction: number;
}

export interface EquipmentListProps {
  categories: Category[];
  dispatch: (action: EquipmentAction) => void;
  equipment: EquipmentTable;
  selectedEquipment: EquipmentTable;
  state: EquipmentState;
  userRestriction: number;
}
