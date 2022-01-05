import React, { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import { AdminAction, AdminUIProps } from "../../../admin/types";
import { ResourceInstance } from "../../../resources/types";

const useStyles = makeStyles({
  record: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    cursor: "pointer",
  },
});

interface RecordTemplate {
  document: ResourceInstance;
  template: string[][];
}
const Record: FunctionComponent<
  RecordTemplate & Pick<AdminUIProps, "dispatch">
> = ({ dispatch, document, template }) => {
  const classes = useStyles();
  return (
    <Card
      className={classes.record}
      onClick={(): void =>
        dispatch({
          type: AdminAction.SelectedDocument,
          payload: { resourceInstance: document },
        })
      }
    >
      <CardContent>
        <List>
          {template.map(([key, value], index) => (
            <ListItem key={`record_${key}_${index}`}>
              {key}: {value}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Record;
