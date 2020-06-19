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
import User from "../resources/User";

const MoreMenu: FunctionComponent<{ inAdminApp?: boolean }> = ({
  inAdminApp,
}) => {
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
    sessionStorage.clear();
    setUser(new User());
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
          <MenuItem
            onClick={(): Promise<void> =>
              navigate(inAdminApp ? "/calendar" : "/admin")
            }
          >
            <Typography>
              {inAdminApp ? "Switch to calendar" : "Switch to admin app"}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default MoreMenu;
