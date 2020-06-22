let categories = [
    { id: 1, title: "drums", parentId: 18 },
    { id: 2, title: "accessory", parentId: 19 },
    { id: 4, title: "bass", parentId: 19 },
    { id: 5, title: "guitar", parentId: 19 },
    { id: 6, title: "accessory", parentId: 20 },
    { id: 7, title: "controllers", parentId: 20 },
    { id: 8, title: "drum machines", parentId: 20 },
    { id: 9, title: "drums", parentId: 20 },
    { id: 10, title: "expression", parentId: 20 },
    { id: 11, title: "interface", parentId: 20 },
    { id: 12, title: "accessory", parentId: 21 },
    { id: 13, title: "condenser", parentId: 21 },
    { id: 14, title: "dynamic", parentId: 21 },
    { id: 15, title: "ribbon", parentId: 21 },
    { id: 16, title: "tube", parentId: 21 },
    { id: 17, title: "accessory", parentId: 22 },
    { id: 18, title: "accessories", parentId: null },
    { id: 19, title: "amplifiers", parentId: null },
    { id: 20, title: "instruments and controllers", parentId: null },
    { id: 21, title: "microphones", parentId: null },
    { id: 22, title: "monitoring", parentId: null },
    { id: 23, title: "guitar", parentId: 20 },
    { id: 24, title: "electric", parentId: 23 },
    { id: 25, title: "acoustic", parentId: 23 },
  ];
  
  function makeTreeLoop(categories, parentId): {} {
    const treeDict = [];
    // get the list of top level categories. This is only needed the first time this function is run, not for any recursoive parts
    categories
      .filter((category) => category.parentId == parentId)
      .forEach(function (category) {
        treeDict.push({
          title: [category.title],
          children: makeTreeLoop(categories, category.id),
        });
      });
    return treeDict;
  }
  
  function scaleTree(tree){
    //get the top level branches
    tree.forEach(function (branch) {
      //create the element for this branch
      if(branch.children.length>0){
        scaleTree(branch.children)
      }
  });
  }
  