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
  name: string; // a specific subcategory; the leaf node
  path: string; // ",root,subcat1,subcat2,"; ""=root
}

class Category implements Category {
  static url = "/api/equipment/category";
  constructor(category = { name: "", path: "" }) {
    Object.assign(this, category);
  }
}

export default Category;
