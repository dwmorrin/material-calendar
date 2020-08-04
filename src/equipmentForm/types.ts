import Category from "../resources/Category";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import Event from "../resources/Event";

export interface EquipmentState {
  filterDrawerIsOpen: boolean;
  equipmentCartIsOpen: boolean;
  categoryDrawerView: boolean;
  searchString: string;
  equipment: Equipment[];
  tags: Tag[];
  categories: Category[];
  selectedTags: { [k: string]: boolean };
  selectedCategory: Category | null;
  categoryPath: Category[];
  setFieldValue: (
    field: string,
    value:
      | string
      | number
      | boolean
      | {
          quantity: number;
          items?:
            | {
                id: number;
                quantity: number;
              }[]
            | undefined;
        }
  ) => void;
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
  selectedEquipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
  setFieldValue: (
    field: string,
    value:
      | string
      | number
      | boolean
      | {
          quantity: number;
          items?:
            | {
                id: number;
                quantity: number;
              }[]
            | undefined;
        }
  ) => void;
  event: Event;
}
