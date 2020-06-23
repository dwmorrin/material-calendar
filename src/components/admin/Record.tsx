import React, { FunctionComponent } from "react";
import {
  Card,
  List,
  ListItem,
  CardContent,
  CardActions,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceInstance } from "../../resources/types";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

const useStyles = makeStyles({
  record: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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
    <Card className={classes.record}>
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
