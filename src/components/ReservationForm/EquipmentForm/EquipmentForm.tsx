import React, { FunctionComponent } from "react";
import { List, AppBar, Toolbar, Dialog, Button } from "@material-ui/core";
import EquipmentList from "./EquipmentList";
import { transition, useStyles } from "./lib";
import { EquipmentFormProps } from "./types";
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
    setFieldValue,
  });
  const classes = useStyles();

  return (
    <Dialog open={open} TransitionComponent={transition}>
      <div className={classes.root}>
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <Button
                type="submit"
                variant="contained"
                aria-label="close"
                onClick={(): void => setOpen(false)}
              >
                Continue with Reservation
              </Button>
            </Toolbar>
          </List>
        </AppBar>
        <EquipmentList
          dispatch={dispatch}
          equipment={equipment}
          state={state}
          selectedEquipment={selectedEquipment}
          userRestriction={user.restriction}
          categories={categories}
        />
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
