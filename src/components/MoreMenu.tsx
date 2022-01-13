import React, { FunctionComponent, MouseEvent, useState } from "react";
import { IconButton, Menu, Typography, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { navigate } from "@reach/router";
import { useAuth, AuthStatus } from "./AuthProvider";
import User from "../resources/User";
import { useSocket, SocketMessageKind } from "./SocketProvider";

const MoreMenu: FunctionComponent<{ inAdminApp?: boolean }> = ({
  inAdminApp,
}) => {
  const { broadcast, getClientCount } = useSocket();
  const { isAdmin, setUser, setStatus, setLastLocation } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;

  const handleClick = (event: MouseEvent<HTMLElement>): void =>
    setAnchorEl(event.currentTarget);

  const handleClose = (): void => setAnchorEl(null);

  const logout = (): void => {
    fetch("/logout", { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then(({ error }) => {
        // eslint-disable-next-line no-console
        if (error) console.error(error);
      })
      // eslint-disable-next-line no-console
      .catch(console.error)
      .finally(() => {
        setStatus(AuthStatus.loggedOut);
        setUser(new User());
        setLastLocation("/");
        navigate(process.env.REACT_APP_LOGOUT_URL || "/");
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
            onClick={(): void => {
              broadcast(SocketMessageKind.Test);
            }}
          >
            <Typography>Broadcast test message</Typography>
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            onClick={(): void => {
              getClientCount();
            }}
          >
            <Typography>Get client count</Typography>
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            onClick={(): void => {
              broadcast(SocketMessageKind.Refresh);
            }}
          >
            <Typography>Broadcast refresh request</Typography>
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            onClick={(): void => {
              const destination = inAdminApp ? "/calendar" : "/admin";
              setLastLocation(destination);
              navigate(destination);
            }}
          >
            <Typography>
              Switch to {inAdminApp ? "calendar" : "scheduler"}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default MoreMenu;
