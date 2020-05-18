interface Gear {
  id: string | null;
  parentId: string;
  title: string;
  tags: string;
  quantity: number;
}

class Gear implements Gear {
  constructor(gear: Gear) {
    Object.assign(this, gear);
  }
}

export default Gear;
