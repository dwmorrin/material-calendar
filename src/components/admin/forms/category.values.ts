import Category from "../../../resources/Category";
import { AdminState } from "../../../admin/types";

interface CategoryFormValues extends Record<string, unknown> {
  id: number;
  title: string;
  parentId: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const category = state.resourceInstance as Category;
  return {
    id: category.id,
    title: category.title,
    parentId: category.parentId ? String(category.parentId) : "",
  } as CategoryFormValues;
};

export const update = (
  _: AdminState,
  values: Record<string, unknown>
): Category => {
  const { id, title, parentId } = values as CategoryFormValues;
  return {
    id,
    title,
    parentId: parentId ? Number(parentId) : null,
  };
};
