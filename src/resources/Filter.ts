interface Filter {
  name: string;
  toggle: boolean;
}

class Filter implements Filter {
  constructor(name: string, toggle: boolean | undefined) {
    this.name = name;
    if (toggle) {
      this.toggle = toggle;
    } else {
      this.toggle = false;
    }
  }
}

export default Filter;
