import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  }
});

interface FilterProps {
  items: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[];
  filters: {
    name: string;
    toggle: boolean;
  }[];
}
const Filter: FunctionComponent<FilterProps> = ({ items, filters }) => {
  const classes = useStyles();
  return <Box>{items.map((item) => item.tags)}</Box>;
};

export default Filter;
