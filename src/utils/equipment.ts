import Equipment from "../resources/Equipment";
// Filtering Function to reduce the size of the equipment array being passed down
export function queryEquipment(
  equipment: Equipment[],
  searchString: string
): Equipment[] {
  let queriedEquipment: Equipment[] = [];
  if (searchString !== "") {
    const queries = searchString.split(/\W+/);
    queriedEquipment = equipment.filter(function (equipment) {
      return queries.every(function (query) {
        return (
          equipment.description
            .toLowerCase()
            .includes(query.toLowerCase().trim()) ||
          equipment.category.path ||
          equipment.category.name
            .toLowerCase()
            .includes(query.toLowerCase().trim()) ||
          equipment.tags.some(function (tag) {
            return tag.name.toLowerCase().includes(query.toLowerCase().trim());
          })
        );
      });
    });
  } else {
    queriedEquipment = equipment;
  }
  return queriedEquipment;
}

// Filtering Function to reduce the size of the equipment array being passed down
export function filterEquipment(
  equipment: Equipment[],
  filters: { [k: string]: boolean }
): Equipment[] | undefined {
  const activeFilters = Object.keys(filters).filter(function (key: string) {
    return filters[key];
  });
  return equipment.filter(function (item) {
    return activeFilters.every(function (filter) {
      return item.tags.some(function (tag) {
        return tag.name.toLowerCase().includes(filter.toLowerCase().trim());
      });
    });
  });
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
): [
  { [k: string]: boolean },
  { [k: string]: Set<string> },
] {
  // Build quantities dictionary for Formik
  // Build Categories Dictionary
  // Build Filters Dictionary
  const filters: { [k: string]: boolean } = {};
  const categories: { [k: string]: Set<string> } = {};
  equipment.forEach((item) => {
    item.tags.forEach((tag) => {
      if (
        !categories[
          item.category.path || item.category.name
        ]
      ) {
        categories[
          item.category.path || item.category.name
        ] = new Set();
      }
      categories[
        item.category.path || item.category.name
      ].add(tag.name);
      filters[tag.name] = false;
    });
  });
  return [filters, categories];
}
