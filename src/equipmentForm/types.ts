import Category from "../resources/Category";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import Event from "../resources/Event";

export type EquipmentValue = {
  quantity: number;
  maxQuantity: number;
  category: { id: number };
  restriction: number;
  items?:
    | {
        id: number;
        quantity: number;
      }[];
};

type EquipmentFormValue = string | number | boolean | EquipmentValue;
export interface EquipmentState {
  filterDrawerIsOpen: boolean;
  equipmentCartIsOpen: boolean;
  categoryDrawerView: boolean;
  searchString: string;
  tags: Tag[];
  selectedTags: { [k: string]: boolean };
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
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedEquipment: { [k: string]: EquipmentValue };
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
  event: Event;
  categories: Category[];
}

export interface EquipmentCartProps {
  state: EquipmentState;
  onClose: () => void;
  onOpen: () => void;
  selectedEquipment: { [k: string]: EquipmentValue };
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
}

export interface EquipmentItemProps {
  item: EquipmentValue;
  name: string;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
  userRestriction: number;
}

export interface EquipmentStandardListProps {
  equipmentList?: Equipment[];
  selectedEquipment: { [k: string]: EquipmentValue };
  userRestriction: number;
  setFieldValue: (field: string, value: EquipmentFormValue) => void;
}
