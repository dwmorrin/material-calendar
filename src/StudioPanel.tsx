import React, { FunctionComponent } from "react";
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});
  interface IStudioPanelProps {
    pageContents: ( { id: string; parentId: string; title: string })[];
  }
  const StudioPanel: FunctionComponent<IStudioPanelProps> = ({
    pageContents,
  }) => {
    const parents = [... new Set(pageContents.map(items => items.parentId))];
    const classes = useStyles();
    return (
    <div className={classes.root}>
      {parents.map((parent, index) =>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-label="Expand"
          aria-controls="additional-actions1-content"
          id="additional-actions1-header"
        >
          <FormControlLabel
            aria-label="Acknowledge"
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={<Checkbox />}
            label={parent}
          />
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        <List>
          {pageContents.map(location => (
            location.parentId===parent ?
            <ListItem button key={location.id}>
              <Checkbox
        size="small"
        inputProps={{ 'aria-label': 'checkbox with small size' }}
      />
              <ListItemText primary={location.title} />
            </ListItem>
            :
            void(0)
          ))}
        </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      )}
    </div>
  );
};
export default StudioPanel;