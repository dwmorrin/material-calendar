import Category from "../../resources/Category";

const template = (category: unknown): string[][] => {
  if (category instanceof Category) {
    const record = [
      ["ID", category.id.toString()],
      ["Title", category.title],
    ];
    if (category.parentId)
      // TODO: find parent title from state
      record.push(["Parent ID", category.parentId.toString()]);
    return record;
  } else return [["", JSON.stringify(category)]];
};

export default template;
