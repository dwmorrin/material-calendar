import Category from "../resources/Category";

// Function to check if an input id exists in the path (parent,
// parent's parent, etc) of an input category
export function checkPath(
  categories: Category[],
  id: number,
  selectedCategory: Category | null
): boolean {
  if (!selectedCategory) {
    return false;
  }
  if (selectedCategory.id === id) {
    return true;
  }
  if (selectedCategory.parentId) {
    return checkPath(
      categories,
      id,
      categories.find(
        (category) => category.id === selectedCategory?.parentId
      ) || null
    );
  }
  return false;
}
