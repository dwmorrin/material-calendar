import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import TextField from "@material-ui/core/TextField";
import FilterList from "./FilterList";

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
  filters: {
    name: string;
    toggle: boolean;
  }[];
  toggleFunction: (filter: { name: string; toggle: boolean }) => void;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  searchString,
  setSearchString,
  items,
  filters,
  open,
  onClose,
  onOpen,
  toggleFunction
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
            value={searchString}
            onChange={(event): void => {
              event.stopPropagation();
              setSearchString(event.target.value);
            }}
            onClick={(event): void => {
              event.stopPropagation();
            }}
            variant="outlined"
          />
          <br />
          <br />
          <br />
          <FilterList filters={filters} toggleFunction={toggleFunction} />
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
