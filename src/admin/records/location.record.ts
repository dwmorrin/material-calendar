import Location from "../../resources/Location";

const template = (location: unknown): string[][] =>
  location instanceof Location
    ? [
        ["ID", location.id.toString()],
        ["Title", location.title],
        ["Group", location.groupId],
      ]
    : [["", JSON.stringify(location)]];
export default template;
