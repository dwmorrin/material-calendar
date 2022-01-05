import Location from "../../../resources/Location";

const template = (location: unknown): string[][] =>
  location instanceof Location
    ? [
        ["ID", location.id.toString()],
        ["Title", location.title],
        ["Group", location.groupId],
        ["Restriction", location.restriction.toString()],
      ]
    : [["", JSON.stringify(location)]];
export default template;
