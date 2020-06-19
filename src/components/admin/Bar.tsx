import React, { FunctionComponent } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import MoreMenu from "../MoreMenu";
import { AdminAction, AdminUIProps } from "../../admin/types";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
    color: "white",
  },
  toolbar: {
    paddingRight: 0,
  },
}));

const AdminBar: FunctionComponent<AdminUIProps> = ({ dispatch }) => {
  const classes = useStyles();
  return (
    <AppBar position="sticky">
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={(): void => dispatch({ type: AdminAction.ToggleDrawer })}
        >
          <MenuIcon />
        </IconButton>
        <Typography className={classes.title}>Calendar Admin</Typography>
        <MoreMenu inAdminApp />
      </Toolbar>
    </AppBar>
  );
};

export default AdminBar;
