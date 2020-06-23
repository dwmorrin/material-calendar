import Category from "../resources/Category";

export function checkPath(
  categories: Category[],
  currentCategory: Category | null,
  id: number,
  recurse: number | null
): boolean {
  //TODO this can be changed to have recurse replace currentCategory and have 3 inputs instead of 4.
  const checkingCategory = recurse
    ? categories.find((category) => category.id === recurse)
    : currentCategory;
  if (!checkingCategory) {
    return false;
  }
  if (checkingCategory.id === id) {
    return true;
  }
  if (checkingCategory.parentId) {
    return checkPath(
      categories,
      currentCategory,
      id,
      checkingCategory.parentId
    );
  }
  return false;
}
