import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import TextField from "@material-ui/core/TextField";
import FilterList from "./FilterList";
import Tag from "../resources/Tag";

const useStyles = makeStyles({
  list: {
    width: 250,
  }
});

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  closeDrawer: () => void;
  filters: { [k: string]: boolean };
  validTags: string[];
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  searchString,
  setSearchString,
  filters,
  validTags,
  open,
  onClose,
  onOpen,
  closeDrawer,
  setFieldValue,
}) => {
  const classes = useStyles();
  // Still need to add X to clear textbox and close drawer on enter
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
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <TextField
            size="small"
            id="equipmentSearch"
            label="Search"
            value={searchString}
            onChange={(event): void => {
              event.stopPropagation();
              setSearchString(event.target.value);
            }}
            onClick={(event): void => {
              event.stopPropagation();
            }}
            onKeyPress={(ev): void => {
              if (ev.key === "Enter") {
                closeDrawer();
                ev.preventDefault();
              }
            }}
            variant="outlined"
          />

          {
            // If the user has expanded a category
            validTags ? (
              <div>
                  <div
                    style={{
                      paddingTop: "20",
                      marginTop: "20",
                    }}
                  >
                    <br />
                    <br />
                    Filters
                  </div>
                  <div
                    style={{
                      paddingTop: "0",
                      margin: "0",
                    }}
                  >
                    <FilterList
                      filters={filters}
                      validTags={validTags}
                      setFieldValue={setFieldValue}
                    />
                  </div>
                </div>
            ) : (
              // If the user has NOT expanded a category
              <div>Expand a category to see filters</div>
            )
          }
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
