/**
 * Category is hierarchial: a tree structure.
 * Top level categories are roots.
 * Specific subcategories are leafs.
 * example: electric guitar
 *   name: electric guitar; path: ,guitar,electric,
 * Use TAGS for properties that are not hierchial.
 * Continuing the guitar example, tag the type of pickups, color, etc.
 */
interface Category {
  [k: string]: unknown;
  id: number;
  title: string;
  parentId: number | null; // null => top level category
  children?: Category[];
}

class Category implements Category {
  static url = "/api/categories";
  constructor(
    category = {
      id: -1,
      title: "",
      parentId: null as number | null,
    }
  ) {
    Object.assign(this, category);
  }

  static tree(
    categories: Category[],
    parentId = null as number | null
  ): Category[] {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: Category.tree(categories, category.id),
      }));
  }


// Function to check if an input id exists in the path (parent,
// parent's parent, etc) of an input category
static checkPath(
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
    return Category.checkPath(
      categories,
      id,
      categories.find(
        (category) => category.id === selectedCategory?.parentId
      ) || null
    );
  }
  return false;
}
}

export default Category;
