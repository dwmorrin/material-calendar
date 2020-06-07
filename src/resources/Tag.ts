interface Tag {
  [k: string]: unknown;
  id: string;
  name: string;
  category: string;
}

class Tag implements Tag {
  static url = "/api/equipment/tag";
  constructor(tag = { id: "", name: "", category: "" }) {
    Object.assign(this, tag);
  }
}

export default Tag;
