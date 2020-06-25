import React, { FunctionComponent, MouseEvent, useState } from "react";
import { IconButton, Menu, Typography, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";
import { EquipmentActionTypes } from "../equipmentForm/types";

interface EquipmentViewToggleMenuProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
}

const EquipmentViewToggleMenu: FunctionComponent<EquipmentViewToggleMenuProps> = ({
  state,
  dispatch,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = !!anchorEl;
  const handleClick = (event: MouseEvent<HTMLElement>): void =>
    setAnchorEl(event.currentTarget);
  const handleClose = (): void => setAnchorEl(null);

  const toggleView = (): void => {
    dispatch({
      type: EquipmentActionTypes.SelectedCategory,
      payload: {},
    });
    dispatch({
      type: EquipmentActionTypes.ClearCategoryHistory,
      payload: {},
    });
    dispatch({
      type: EquipmentActionTypes.ToggleEquipmentViewMode,
      payload: {},
    });
    handleClose();
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
        <MenuItem onClick={toggleView}>
          <Typography>
            {state.categoryDrawerView
              ? "Switch To Nested List Navigation"
              : "Switch to Category Drawer Navigation"}
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default EquipmentViewToggleMenu;
