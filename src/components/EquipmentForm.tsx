import React, { FunctionComponent, useState, useEffect } from "react";
import {
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import FilterDrawer from "./FilterDrawer";
import FilterListIcon from "@material-ui/icons/FilterList";
import EquipmentList from "./EquipmentList";
import Equipment from "../resources/Equipment";
import Tag from "../resources/Tag";
import Category from "../resources/Category";
import {
  fetchAllEquipmentResources,
  filterEquipment,
  makeToggleFilterDrawer,
  makeValidTags,
  quantizeEquipment,
  queryEquipment,
  transition,
  useStyles,
} from "../calendar/equipmentForm";

interface EquipmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedEquipment: {
    [k: string]: number;
  };
  setFieldValue: (field: string, value: number | string | boolean) => void;
}

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  open,
  setOpen,
  selectedEquipment,
  setFieldValue,
}) => {
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [equipment, setEquipment] = useState([] as Equipment[]);
  const [tags, setTags] = useState([] as Tag[]);
  const [categories, setCategories] = useState([] as Category[]);
  const [filters, setFilters] = useState({} as { [k: string]: boolean });
  const [currentCategory, setCurrentCategory] = useState("");
  const classes = useStyles();
  const quantizedEquipment = quantizeEquipment(equipment);
  const toggleFilterDrawer = makeToggleFilterDrawer(
    filterDrawerIsOpen,
    setFilterDrawerIsOpen
  );

  useEffect(
    () => fetchAllEquipmentResources(setEquipment, setCategories, setTags),
    []
  );

  return (
    <Dialog fullScreen open={open} TransitionComponent={transition}>
      <div className={classes.root}>
        <FilterDrawer
          open={filterDrawerIsOpen}
          onOpen={toggleFilterDrawer}
          onClose={toggleFilterDrawer}
          validTags={makeValidTags(tags, currentCategory)}
          filters={filters}
          searchString={searchString}
          setSearchString={setSearchString}
          closeDrawer={(): void => setFilterDrawerIsOpen(!filterDrawerIsOpen)}
          setFieldValue={setFieldValue}
        />
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <IconButton
                type="submit"
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={(): void => setOpen(false)}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography className={classes.title}>Equipment</Typography>
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleFilterDrawer}
                aria-label="filter"
              >
                <FilterListIcon />
              </IconButton>
            </Toolbar>
          </List>
        </AppBar>
        <EquipmentList
          equipmentList={filterEquipment(
            queryEquipment(quantizedEquipment, searchString),
            filters
          )}
          currentCategory={currentCategory}
          selectedEquipment={selectedEquipment}
          setFieldValue={setFieldValue}
        />
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
