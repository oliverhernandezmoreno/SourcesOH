import React from "react";
import { Typography, Box, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";

const styles = (theme) => ({
  switchBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    background: "#262629",
    // borderRadius: "5px",
    padding: theme.spacing(2),
    border: "1px solid #6d6d6d;",
    borderBottom: "none",
  },
  lastRow: {
    borderBottom: "1px solid #6d6d6d",
    borderRadius: `0 0 ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  },

  firstRow: {
    borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0 `,
  },
  switchDescription: {
    alignSelf: "center",
  },
  details__disclaimer: {
    marginBottom: "1.5rem",
  },
  collapsableRow: {
    border: "1px solid #6d6d6d",
    borderTop: "none",
    borderBottom: "none",
    background: "#1b1b1b",
  },
  switchSubLabel: {
    fontWeight: 'initial',
  },
  row: {
    '& > div': {
      maxWidth: '90%',
    },
  },
});

const useStyles = makeStyles(styles);

const FormattedListItem = ({ className, children, ...otherProps }) => {
  const classes = useStyles();

  return (
    <ListItem
      className={[classes.switchBox, className].join(" ")}
      {...otherProps}
    >
      {children}
    </ListItem>
  );
};

const SwitchLabel = ({ children }) => {
  const classes = useStyles();

  return (
    <Typography
      component="div"
      variant="body1"
      color="textSecondary"
      className={classes.switchDescription}
    >
      <Box fontWeight="fontWeightBold">{children}</Box>
    </Typography>
  );
};

const SwitchSubLabel = ({ children }) => {
  const classes = useStyles();

  return (
    <Typography
      component="div"
      variant="body1"
      color="textSecondary"
      className={classes.switchSubLabel}
    >
      <Box>{children}</Box>
    </Typography>
  );
};

const SwitchListItem = ({
  className,
  text,
  subText,
  onChange,
  checked,
  otherSwitchProps,
  isFirst,
  isLast,
}) => {
  const classes = useStyles();

  return (
    <FormattedListItem
      className={[
        isFirst ? classes.firstRow : "",
        isLast ? classes.lastRow : "",
        classes.row,
        className,
      ].join(" ")}
    >
      <div>
        <ListItemText
          id="switch-list-label-wifi"
          primary={<SwitchLabel>{text}</SwitchLabel>}
        />
        {subText && <ListItemText
          primary={<SwitchSubLabel>{subText}</SwitchSubLabel>}
        />}
      </div>
      <ListItemSecondaryAction>
        {checked !== "none" && (
          <Switch
            edge="end"
            onChange={onChange}
            checked={checked}
            {...otherSwitchProps}
          />
        )}
      </ListItemSecondaryAction>
    </FormattedListItem>
  );
};

const CollapsableListItem = ({
  open,
  title,
  subTitle,
  onTitleClick,
  listItemProps,
  onSwitchChange,
  itemsStatus,
  items,
  isFirst,
  isLast,
  otherSwitchProps
}) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <FormattedListItem
        className={
          [isFirst ? classes.firstRow : "", isLast && !open ? classes.lastRow : "", classes.row].join(' ')
        }
        button
        onClick={onTitleClick}
        {...listItemProps}
      >
        <ListItemText primary={<SwitchLabel>{title}</SwitchLabel>} 
                      secondary={subTitle}/>
        {open ? <ExpandLess /> : <ExpandMore />}
      </FormattedListItem>
      <Collapse in={open} timeout="auto" unmountOnExit className={isLast ? classes.lastRow : "" }>
        <List
          component="div"
          disablePadding
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Por favor indica los sectores donde se presenta el problema
            </ListSubheader>
          }
          className={[classes.collapsableRow, isLast ? classes.lastRow : ""].join(' ')}
        >
          {items.map(({ id, label }, index) => {
            return (
              <React.Fragment key={id}>
                <ListItem className={classes.nested} >
                  <ListItemText
                    id="switch-list-label-wifi"
                    primary={
                      <Typography
                        component="div"
                        variant="body1"
                        color="textSecondary"
                      >
                        {label}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      onChange={(event) => onSwitchChange(id, event)}
                      checked={itemsStatus?.[id]}
                      {...otherSwitchProps}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < items.length && <Divider variant="middle" component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </Collapse>
    </React.Fragment>
  );
};

export default function SwitchesPanel({
  switchPanelData,
  switchPanelItemsStatus,
  collapsableItemsStatus,
  onCollapsableItemClick,
  onSwitchChange,
  disableActions
}) {
  return (
    <List>
      {switchPanelData.map(({ id, label, subLabel, list }, index) => {
        if (!list) {
          return (
            <SwitchListItem
              isFirst={index === 0}
              isLast={index === switchPanelData.length - 1}
              key={id}
              text={label}
              subText={subLabel}
              checked={switchPanelItemsStatus?.[id]}
              onChange={(event) => onSwitchChange(id, event)}
              otherSwitchProps={{
                disabled: disableActions
              }}
            />
          );
        }

        return (
          <CollapsableListItem
            isFirst={index === 0}
            isLast={index === switchPanelData.length - 1}
            key={id}
            open={collapsableItemsStatus?.[id]}
            title={label}
            subTitle={subLabel}
            items={list}
            itemsStatus={switchPanelItemsStatus}
            onTitleClick={(event) => onCollapsableItemClick(id, event)}
            onSwitchChange={onSwitchChange}
            otherSwitchProps={{
              disabled: disableActions
            }}
          />
        );
      })}
    </List>
  );
}
