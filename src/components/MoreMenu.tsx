import React, { FunctionComponent, MouseEvent, useState } from "react";
import { IconButton, Menu, Typography, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { navigate } from "@reach/router";
import { useAuth, AuthStatus } from "./AuthProvider";
import User from "../resources/User";

const MoreMenu: FunctionComponent<{ inAdminApp?: boolean }> = ({
  inAdminApp,
}) => {
  const { user, setUser, setStatus } = useAuth();
  const isAdmin = process.env.NODE_ENV === "development" || User.isAdmin(user);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;

  const handleClick = (event: MouseEvent<HTMLElement>): void =>
    setAnchorEl(event.currentTarget);

  const handleClose = (): void => setAnchorEl(null);

  const logout = (): void => {
    fetch("/logout", { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then(({ error }) => {
        if (error) console.error(error);
      })
      .catch(console.error)
      .finally(() => {
        setStatus(AuthStatus.loggedOut);
        setUser(new User());
        navigate("/");
      });
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
