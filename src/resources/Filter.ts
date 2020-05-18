interface Filter {
  name: string;
  toggle: boolean;
}

class Filter implements Filter {
  constructor(filter: Filter) {
    Object.assign(this, filter);
  }
}

export default Filter;
