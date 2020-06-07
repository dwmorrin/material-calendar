import React, {
  FunctionComponent,
  MouseEvent,
  useContext,
  useState,
} from "react";
import { IconButton, Menu, Typography, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { navigate } from "@reach/router";
import { AuthContext } from "./AuthContext";

const MoreMenu: FunctionComponent = () => {
  const { user, setUser } = useContext(AuthContext);
  const isAdmin = user && user.roles.includes("admin");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;

  const handleClick = (event: MouseEvent<HTMLElement>): void =>
    setAnchorEl(event.currentTarget);

  const handleClose = (): void => setAnchorEl(null);

  const logout = (): void => {
    if (!user || !setUser) {
      throw new Error("no method to logout user");
    }
    fetch("/logout", {
      method: "POST",
      credentials: "include",
    });
    user.id = ""; // TODO unset the entire user object, gracefully
    sessionStorage.clear();
    setUser(user);
    navigate("/");
  };

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="more"
        aria-controls="more-menu"
        aria-haspopup="true"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={logout}>
          <Typography>Logout</Typography>
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={(): Promise<void> => navigate("/admin")}>
            <Typography>Switch to admin app</Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default MoreMenu;
