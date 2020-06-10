import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import TextField from "@material-ui/core/TextField";
import FilterList from "./FilterList";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  closeDrawer: () => void;
  filters: { [k: string]: boolean };
  visibleFilters: Set<string>;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  matchAny: boolean;
  setMatchAny: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  searchString,
  setSearchString,
  filters,
  visibleFilters,
  open,
  onClose,
  onOpen,
  matchAny,
  setMatchAny,
  closeDrawer,
  setFieldValue,
}) => {
  const classes = useStyles();
  // Still need to add X to clear textbox and close drawer on enter

  // Set anchor for any/all match menu
  // handleClick of any/all match menu button
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  // handleClose of any/all match menu
  const handleClose = (): void => {
    setAnchorEl(null);
  };

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
            visibleFilters ? (
              <div>
                <div
                  style={{
                    padding: "0",
                    margin: "0",
                  }}
                >
                  <br />
                  <div
                    style={{
                      paddingTop: "20",
                      marginTop: "20",
                    }}
                  >
                    Match{" "}
                    <Button
                      style={{
                        padding: "0",
                        margin: "0",
                      }}
                      aria-controls="MatchAnyButton"
                      aria-haspopup="true"
                      size="small"
                      onClick={(event): void => {
                        event.stopPropagation();
                        handleClick(event);
                      }}
                    >
                      {matchAny ? <b>ANY</b> : <b>ALL</b>}
                    </Button>
                    <Menu
                      id="MatchAnyMenu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={(): void => {
                        handleClose();
                      }}
                    >
                      <MenuItem
                        onClick={(event): void => {
                          event.stopPropagation();
                          handleClose();
                        }}
                      >
                        {matchAny ? <b>ANY</b> : <b>ALL</b>}
                      </MenuItem>
                      <MenuItem
                        onClick={(event): void => {
                          event.stopPropagation();
                          setMatchAny(!matchAny);
                          handleClose();
                        }}
                      >
                        {matchAny ? <b>ALL</b> : <b>ANY</b>}
                      </MenuItem>
                    </Menu>{" "}
                    Selected Filters
                  </div>
                  <div
                    style={{
                      paddingTop: "0",
                      margin: "0",
                    }}
                  >
                    <FilterList
                      filters={filters}
                      visibleFilters={visibleFilters}
                      setFieldValue={setFieldValue}
                    />
                  </div>
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
