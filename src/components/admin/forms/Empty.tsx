import React, { FunctionComponent } from "react";
import { List } from "@material-ui/core";
import { FormValues } from "../../../admin/types";

const FormTemplate: FunctionComponent<FormValues> = () => (
  <List>
    <div>
      Yikes, we do not have an interface for updating this resource yet...
    </div>
    <div>
      It is possible this is an aggregate data type. For instance, user groups
      are derived from the user relationships. To update user groups, update the
      relationships in the individual user accounts.
    </div>
  </List>
);

export default FormTemplate;
