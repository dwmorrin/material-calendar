import Equipment from "../resources/Equipment";
// Filtering Function to reduce the size of the equipment array being passed down
export function filterEquipment(
  searchString: string,
  equipment: Equipment[],
  filters: { [k: string]: boolean }
): Equipment[] | undefined {
  let queriedEquipment: Equipment[] = [];
  const activeFilters = Object.keys(filters).filter(function (key: string) {
    return filters[key];
  });
  if (searchString !== "") {
    const queries = searchString.split(/\W+/);
    queriedEquipment = equipment.filter(function (equipment) {
      return queries.every(function (query) {
        return (
          equipment.description
            .toLowerCase()
            .includes(query.toLowerCase().trim()) ||
          equipment.category
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
  return queriedEquipment.filter(function (equipment) {
    return activeFilters.every(function (filter) {
      return equipment.tags.some(function (tag) {
        return tag.name.toLowerCase().includes(filter.toLowerCase().trim());
      });
    });
  });
}
