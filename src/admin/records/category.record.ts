import Category from "../../resources/Category";

const template = (category: unknown): string[][] =>
  category instanceof Category
    ? [
        ["ID", category.id.toString()],
        ["Title", category.title],
        ["Parent ID", category.parentId?.toString() || "NULL"],
      ]
    : [["", JSON.stringify(category)]];

export default template;
