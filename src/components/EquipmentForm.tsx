import React, { FunctionComponent, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
import { makeTransition } from "./Transition";
import Equipment from "../resources/Equipment";
import { queryEquipment, filterEquipment } from "../utils/equipment";
import Tag from "../resources/Tag";
import { quantizeEquipment } from "../utils/equipment";
import { ResourceKey } from "../resources/types";
import Category from "../resources/Category";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
    textAlign: "center",
    fontSize: "18px",
  },
}));

const transition = makeTransition("up");

interface EquipmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedEquipment: {
    [k: string]: number;
  };
  // filters: {
  //   [k: string]: boolean;
  // };
  // currentCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  open,
  setOpen,
  selectedEquipment,
  // filters,
  // currentCategory,
  setFieldValue,
}) => {
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [equipment, setEquipment] = useState([] as Equipment[]);
  const [tags, setTags] = useState([] as Tag[]);
  const [categories, setCategories] = useState([] as Category[]);
  const [filters, setFilters] = useState({} as { [k: string]: boolean });
  const [currentCategory, setCurrentCategory] = useState("");
  useEffect(() => {
    const resourceUrls = [
      `/api/equipment?context=${ResourceKey.Equipment}`,
      `/api/categories?context=${ResourceKey.Categories}`,
      `/api/tag?context=${ResourceKey.Tags}`,
    ];
    Promise.all(resourceUrls.map((url) => fetch(url))).then((responses) =>
      Promise.all(responses.map((response) => response.json())).then(
        (dataArray) => {
          dataArray.forEach(({ data, context }) => {
            switch (+context) {
              case ResourceKey.Equipment:
                setEquipment(
                  data.map((d: unknown) => new Equipment(d as never))
                );
                break;
              case ResourceKey.Categories:
                setCategories(
                  data.map((d: unknown) => new Category(d as never))
                );
                break;
              case ResourceKey.Tags:
                setTags(data.map((d: unknown) => new Tag(d as never)));
                break;
              default:
                throw new Error(
                  `unhandled resource fetch in equipment form with ${context}`
                );
            }
          });
        }
      )
    );
  }, []);

  // Constant Declarations
  const classes = useStyles();
  const quantizedEquipment = quantizeEquipment(equipment);
  const validTags = tags
    .filter(
      (tag) =>
        tag.category.name === currentCategory ||
        tag.category.path === currentCategory
    )
    .map((tag) => tag.name)
    .filter((v, i, a) => a.indexOf(v) === i);

  // Filter Drawer Toggle Function
  const toggleFilterDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setFilterDrawerIsOpen(!filterDrawerIsOpen);
  };

  return (
    <Dialog fullScreen open={open} TransitionComponent={transition}>
      <div className={classes.root}>
        <FilterDrawer
          open={filterDrawerIsOpen}
          onOpen={toggleFilterDrawer}
          onClose={toggleFilterDrawer}
          validTags={validTags}
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
                onClick={toggleFilterDrawer()}
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
