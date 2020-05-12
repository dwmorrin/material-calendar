import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState
} from "react";
import { makeStyles } from "@material-ui/core/styles";

interface GearItemProps {
  item: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  };
}
const GearItem: FunctionComponent<GearItemProps> = ({ item }) => {
  const [value, setValue] = useState(0);
  const handleChange = (change: number): void => {
    setValue(value + change);
  };
  return (
    <div>
      <ListItem
        button
        key={item.id}
        onClick={(event): void => event.stopPropagation()}
      >
        <ListItemText primary={item.title} />
        <ButtonGroup
          variant="contained"
          color="primary"
          aria-label="contained primary button group"
          size="small"
        >
          <Button onClick={(): void => handleChange(-1)}>-</Button>
          <Button onClick={(): void => handleChange(1)}>+</Button>
        </ButtonGroup>
        {value}
      </ListItem>
    </div>
  );
};
export default GearItem;
