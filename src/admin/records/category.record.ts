import Category from "../../resources/Category";

const template = (category: unknown): string[][] =>
  category instanceof Category
    ? [
        ["Name", category.name],
        ["Hierarchy", category.path || category.name],
      ]
    : [["", JSON.stringify(category)]];

export default template;
