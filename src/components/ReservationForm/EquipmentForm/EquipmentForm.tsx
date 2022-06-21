import React, { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputAdornment,
  Toolbar,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EquipmentList from "./EquipmentList";
import { transition } from "./lib";
import { EquipmentActionTypes, EquipmentFormProps } from "./types";
import reducer, { initialState } from "./reducer";
import { useAuth } from "../../AuthProvider";

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  equipment,
  open,
  setOpen,
  selectedEquipment,
  setFieldValue,
  categories,
}) => {
  const { user } = useAuth();
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    equipment,
    filteredEquipment: equipment,
    setFieldValue,
  });

  return (
    <Dialog open={open} TransitionComponent={transition}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>Equipment</DialogTitle>
      </Toolbar>
      <Input
        type="text"
        value={state.searchString}
        placeholder="Search"
        style={{ backgroundColor: "white" }}
        onChange={(e): void =>
          dispatch({
            type: EquipmentActionTypes.ChangedSearchString,
            payload: { searchString: e.target.value },
          })
        }
        endAdornment={
          state.searchString.length ? (
            <InputAdornment position="end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={(): void =>
                  dispatch({
                    type: EquipmentActionTypes.ChangedSearchString,
                    payload: { searchString: "" },
                  })
                }
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
      <DialogContent>
        <EquipmentList
          dispatch={dispatch}
          equipment={state.filteredEquipment}
          state={state}
          selectedEquipment={selectedEquipment}
          userRestriction={user.restriction}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentForm;
