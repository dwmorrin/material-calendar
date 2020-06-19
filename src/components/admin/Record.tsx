import React, { FunctionComponent } from "react";
import {
  Card,
  List,
  ListItem,
  CardContent,
  CardActions,
  IconButton,
} from "@material-ui/core";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceInstance } from "../../resources/types";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

interface RecordTemplate {
  document: ResourceInstance;
  template: string[][];
}
const Record: FunctionComponent<
  RecordTemplate & Pick<AdminUIProps, "dispatch">
> = ({ dispatch, document, template }) => {
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
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
      <CardActions>
        <IconButton
          onClick={(): void =>
            dispatch({
              type: AdminAction.SelectedDocument,
              payload: { resourceInstance: document },
            })
          }
        >
          <ArrowForwardIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default Record;
