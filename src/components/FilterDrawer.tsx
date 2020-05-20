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
  closeDrawer: () => void;
  filters: { [k: string]: boolean };
  visibleFilters: Set<string>;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  matchAny: boolean;
  setMatchAny: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
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
  handleChange
}) => {
  const classes = useStyles();
  // Still need to add X to clear textbox and close drawer on enter
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  //const filterDisplay = Object.keys(filters);
  const filterDisplay = visibleFilters;

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
            textAlign: "center"
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
            onKeyPress={(ev): void => {
              if (ev.key === "Enter") {
                closeDrawer();
                ev.preventDefault();
              }
            }}
            variant="outlined"
          />
          {filterDisplay ? (
            <div>
              <div
                style={{
                  padding: "0",
                  margin: "0"
                }}
              >
                <br />
                <div
                  style={{
                    paddingTop: "20",
                    marginTop: "20"
                  }}
                >
                  Match{" "}
                  <Button
                    style={{
                      padding: "0",
                      margin: "0"
                    }}
                    aria-controls="simple-menu"
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
                    id="simple-menu"
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
                    margin: "0"
                  }}
                >
                  <FilterList
                    filters={filters}
                    visibleFilters={visibleFilters}
                    handleChange={handleChange}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>Expand a category to see filters</div>
          )}
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
