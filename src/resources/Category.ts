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
}

export default Category;
