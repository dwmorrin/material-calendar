import React, { FunctionComponent } from "react";
import { Button } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";

const SaveButton: FunctionComponent = () => (
  <Button
    type="submit"
    startIcon={<SaveIcon />}
    variant="contained"
    color="primary"
    style={{ marginRight: 30 }}
  >
    Save
  </Button>
);

export default SaveButton;
