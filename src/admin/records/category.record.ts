import Category from "../../resources/Category";
import { ResourceKey } from "../../resources/types";
import { AdminState } from "../types";

const template = (category: unknown, state: AdminState): string[][] => {
  if (category instanceof Category) {
    const record = [
      ["ID", category.id.toString()],
      ["Title", category.title],
    ];
    if (category.parentId) {
      const cats = state.resources[ResourceKey.Categories] as Category[];
      const parent = cats.find(({ id }) => id === category.parentId);
      record.push([
        "Parent",
        parent ? parent.title : "Error: parent not found.",
      ]);
    }
    return record;
  } else return [["", JSON.stringify(category)]];
};

export default template;
