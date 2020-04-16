import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { RouteComponentProps } from "@reach/router";
import TemporaryDrawer from "./TemporaryDrawer";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white"
  }
}));

const Projects: FunctionComponent<RouteComponentProps> = () => {
  const pickerShowing = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const pageContents = [
    {
      id: "Compression Project St3 Sp20",
      parentId: "Engineering the Record",
      title: "Compression Project St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 1 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 1 St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 2 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 2 St3 Sp20"
    },
    {
      id: "Sound-Alike Phase 3 St3 Sp20",
      parentId: "Engineering the Record",
      title: "Sound-Alike Phase 3 St3 Sp20"
    }
  ];

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerIsOpen(!drawerIsOpen);
  };
  return (
    <div className={classes.root}>
      <div onClick={(): void => setDrawerIsOpen(!drawerIsOpen)}>
        <TemporaryDrawer
          open={drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
          pageContents={pageContents}
          panelType={"buttons"}
        />
      </div>
      <AppBar position="sticky">
        <List>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer()}
            >
              <MenuIcon />
            </IconButton>
            <Button className={classes.title}>
              <Typography component="h6">{pageContents[0].title}</Typography>
            </Button>
            <IconButton></IconButton>
          </Toolbar>
        </List>
      </AppBar>
      {pickerShowing && <Box></Box>}
    </div>
  );
};

export default Projects;
