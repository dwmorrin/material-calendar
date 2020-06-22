import Tag from "../../resources/Tag";

const template = (tag: unknown): string[][] =>
  tag instanceof Tag
    ? [
        ["Name", tag.name],
        ["Category", tag.category.title],
      ]
    : [["", JSON.stringify(tag)]];

export default template;
