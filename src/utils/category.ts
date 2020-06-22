import Category from "../resources/Category";

export function makeTree(categories: Category[], parentId: number | null): {'id': number;'title': string; 'children': unknown}[] {
  const treeDict: {'id': number; 'title': string; 'children': unknown}[] = [];
  // get the list of top level categories. This is only needed the first time this function is run, not for any recursoive parts
  categories
    .filter((category) => category.parentId == parentId)
    .forEach(function (category) {
      treeDict.push({
        id: category.id,
        title: category.title,
        children: makeTree(categories, category.id),
      });
    });
  return treeDict;
}