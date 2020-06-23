/**
 * Category is hierarchial: a tree structure.
 * Top level categories are roots.
 * Specific subcategories are leafs.
 * example: electric guitar
 *   name: electric guitar; path: ,guitar,electric,
 * Use TAGS for properties that are not hierchial.
 * Continuing the guitar example, tag the type of pickups, color, etc.
 */
import Equipment from "../resources/Equipment"
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
  static isChildOfParent(
    categories: Category[],
    child: Category | null,
    parent: Category
  ): boolean {
    if (!child) {
      return false;
    }
    if (child.id === parent.id) {
      return true;
    }
    if (child.parentId) {
      return Category.isChildOfParent(
        categories,
        categories.find((category) => category.id === child?.parentId) || null,
        parent
      );
    }
    return false;
  }

static hasContents(
  category: Category | null,
  equipment: Equipment[]
): number {
  if (!category) {
    return 0;
  }
  const sum = equipment.filter((item) => item.category.id === category.id).length;

  if (category.children) {
    return sum + category.children.map((child) => {return Category.hasContents(child,equipment);}).reduce((a, b) => a + b, 0);
  }
  return sum;
}
}

export default Category;
