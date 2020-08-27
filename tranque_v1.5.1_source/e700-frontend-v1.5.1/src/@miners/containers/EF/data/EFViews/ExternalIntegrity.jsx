import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import SwitchesPanel from "@miners/containers/EF/data/EFViews/ExternalIntegrity/SwitchesPanel.jsx";
import * as TimeseriesService from "@app/services/backend/timeseries";
import * as EtlService from "@app/services/backend/etl";
import { getEFLabel } from "@miners/components/EF/EF.labels";

const styles = (theme) => ({
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "#303030",
    height: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
    margin: "30px",
    marginBottom: "0px",
  },
  title: {
    width: "50%",
    height: "100%",
    display: "inline-block",
    position: "relative",
    marginBottom: "2rem",
  },
  body: {
    width: "40%",
    display: "flex",
    flexDirection: "column",
  },
});
class ExternalIntegrity extends SubscribedComponent {
  state = {
    switchPanelData: [],
    switchPanelItemsStatus: {},
    collapsableItemsStatus: {},
  };

  loadSingleData = () => {};

  loadData = () => {
    const promises = this.props.sections.map(
      ({ templateName, label }, index) => {
        return new Promise((resolve, reject) => {
          if (!templateName) {
            /** template name has not been assigned in nav.js */
            resolve({
              canonical_name: label,
              label,
              switchValue: "none",
            });
            return;
          }
          this.subscribe(
            TimeseriesService.list({
              cache: 60 * 1000, // one minute
              target: this.props.target,
              template_name: templateName,
              max_events: 1,
            }),

            (ts) => {
              if (ts.length === 0) {
                /** no entities match this template name */
                resolve({
                  canonical_name: templateName,
                  switchValue: "none",
                  label,
                });
                return;
              }

              if (ts?.[0]?.canonical_name.split(".")?.[1] === "none") {
                /** Non-sectorized target data */
                resolve({
                  canonical_name: ts?.[0]?.canonical_name,
                  switchValue: ts?.[0]?.events?.[0]?.value,
                  label,
                });
                return;
              }

              /** Sectorized data */
              resolve({
                label,
                templateName,
                switchValue: ts.map((result) => {
                  return {
                    canonical_name: result.canonical_name,
                    switchValue: result?.events?.[0]?.value,
                    label: result?.data_source_group?.name,
                  };
                }),
              });
              return;
            }
          );
        });
      }
    );

    Promise.all(promises).then((results) => {
      const switchPanelData = results.map((switchData) => {
        if (!Array.isArray(switchData.switchValue)) {
          return {
            id: switchData.canonical_name,
            label: switchData.label,
          };
        }

        return {
          id: switchData.templateName,
          label: switchData.label,
          list: switchData.switchValue.map((sectorSwitchData) => ({
            id: sectorSwitchData.canonical_name,
            label: sectorSwitchData.label,
          })),
        };
      });

      const switchPanelItemsStatus = results.reduce((prevDict, switchData) => {
        if (!Array.isArray(switchData.switchValue)) {
          prevDict[switchData.canonical_name] = switchData.switchValue;
          return prevDict;
        }

        switchData.switchValue.forEach((sectorSwitchData) => {
          prevDict[sectorSwitchData.canonical_name] =
            sectorSwitchData.switchValue;
        });

        return prevDict;
      }, {});

      const collapsableItemsStatus = results.reduce((prevDict, switchData) => {
        if (!Array.isArray(switchData.switchValue)) {
          return prevDict;
        }

        prevDict[switchData.templateName] = false;
        return prevDict;
      }, {});

      this.setState({
        switchPanelData,
        switchPanelItemsStatus,
        collapsableItemsStatus,
      });
    });
  };

  componentDidMount = () => {
    this.loadData();
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.template !== prevProps.template) {
      this.loadData();
    }
  };
  handleClick = () => {
    this.setState((state) => {
      return {
        open: !state.open,
      };
    });
  };

  requestEventTrigger = (name, value) => {
    this.subscribe(
      EtlService.createImmediately({
        target: this.props.target,
        executor: "direct",
        context: {
          events: [
            {
              name,
              value: value ? 1 : 0,
            },
          ],
        },
      }),
      (response) => {
        if (response.finished && response.state === "success") {
          this.setState((state) => {
            return {
              switchPanelItemsStatus: {
                ...state.switchPanelItemsStatus,
                [name]: !state.switchPanelItemsStatus[name],
              },
            };
          });
        }
      }
    );
  };

  onSwitchChange = (id) => {
    if (this.state.switchPanelItemsStatus[id] === "none") {
      return;
    }

    this.requestEventTrigger(id, !this.state.switchPanelItemsStatus[id]);
  };

  onCollapsableItemClick = (id) => {
    this.setState((state) => {
      return {
        collapsableItemsStatus: {
          ...state.collapsableItemsStatus,
          [id]: !state.collapsableItemsStatus[id],
        },
      };
    });
  };

  render = () => {
    const { classes } = this.props;
    const {
      switchPanelData,
      switchPanelItemsStatus,
      collapsableItemsStatus,
    } = this.state;
    const title = getEFLabel(this.props.template);
    return (
      <Card className={classes.root}>
        <div className={classes.header}>
          <div className={classes.title}>
            <Typography variant="h5">{title}</Typography>
          </div>

          <div className={classes.body}>
            <div className={classes.details__disclaimer}>
              <Typography variant="body1" color="textSecondary">
                Si detectas situaciones como la(s) descrita(s) a continuación,
                puedes informarlo al sistema, lo que permitirá gestionar tickets
                de incidentes o alerta.
              </Typography>
            </div>
            <SwitchesPanel
              switchPanelData={switchPanelData}
              switchPanelItemsStatus={switchPanelItemsStatus}
              collapsableItemsStatus={collapsableItemsStatus}
              onSwitchChange={this.onSwitchChange}
              onCollapsableItemClick={this.onCollapsableItemClick}
            />
          </div>
        </div>
      </Card>
    );
  };
}

export default withStyles(styles)(ExternalIntegrity);
