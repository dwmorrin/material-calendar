import Equipment from "../resources/Equipment";

// Filtering Function to reduce the size of the equipment array being passed down
export function queryEquipment(
  equipment: Equipment[],
  searchString: string
): Equipment[] {
  if (!searchString) {
    return equipment;
  }
  const queries = searchString.trim().toLowerCase().split(/\W+/);
  return equipment.filter((equipment) =>
    queries.every(
      (query) =>
        equipment.description.toLowerCase().includes(query) ||
        equipment.category.path ||
        equipment.category.name.toLowerCase().includes(query) ||
        equipment.tags.some((tag) => tag.name.toLowerCase().includes(query))
    )
  );
}

// Filtering Function to reduce the size of the equipment array being passed down
export function filterEquipment(
  equipment: Equipment[],
  filters: { [k: string]: boolean }
): Equipment[] | undefined {
  const activeFilters = Object.keys(filters)
    .filter((key) => filters[key])
    .map((key) => key.trim().toLowerCase());
  return equipment.filter((item) =>
    activeFilters.every((filter) =>
      item.tags.some((tag) => tag.name.toLowerCase().includes(filter))
    )
  );
}

export function quantizeEquipment(equipment: Equipment[]): Equipment[] {
  return equipment.reduce((quantized: Equipment[], item) => {
    const hasTitle = (equipment: Equipment): boolean =>
      equipment.description === item.description;
    const alreadyDone = quantized.find(hasTitle);
    if (!alreadyDone)
      quantized.push({
        ...item,
        quantity: equipment.filter(hasTitle).length,
      });
    return quantized;
  }, []);
}

// Function to convert equipment Array to Quantized equipment Array
export function buildDictionaries(
  equipment: Equipment[]
): [{ [k: string]: boolean }, { [k: string]: Set<string> }] {
  // Build selectedEquipment dictionary for Formik
  // Build Categories Dictionary
  // Build Filters Dictionary
  const filters: { [k: string]: boolean } = {};
  const categories: { [k: string]: Set<string> } = {};
  equipment.forEach((item) => {
    item.tags.forEach((tag) => {
      if (!categories[item.category.path || item.category.name]) {
        categories[item.category.path || item.category.name] = new Set();
      }
      categories[item.category.path || item.category.name].add(tag.name);
      filters[tag.name] = false;
    });
  });
  return [filters, categories];
}
