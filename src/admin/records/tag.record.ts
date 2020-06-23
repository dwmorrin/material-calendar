import Tag from "../../resources/Tag";

const template = (tag: unknown): string[][] =>
  tag instanceof Tag
    ? [
        ["ID", tag.id.toString()],
        ["Title", tag.title],
        ["Category", tag.category.title],
      ]
    : [["", JSON.stringify(tag)]];

export default template;
