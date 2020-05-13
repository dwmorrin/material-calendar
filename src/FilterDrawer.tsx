import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import TextField from "@material-ui/core/TextField";
import Filter from "./Filter";

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  }
});

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  items: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[];
  /*   filters: {
    name: string;
    toggle: boolean;
  }[]; */
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  items,
  //filters,
  open,
  onClose,
  onOpen
}) => {
  const classes = useStyles();
  return (
    <SwipeableDrawer
      open={open}
      anchor="right"
      onClose={onClose}
      onOpen={onOpen}
    >
      <div className={classes.list} role="presentation">
        <List
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <TextField
            size="small"
            id="outlined-basic"
            label="Search"
            variant="outlined"
          />
          <br />
          <br />
          <br />
          {/* <Filter items={items} filters={filters} /> */}
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
