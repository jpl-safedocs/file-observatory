import { FC, useMemo, useState } from "react";
import useStore from "../utils/store";
import Switch from "@mui/material/Switch";
import Reorder, { reorder } from "react-reorder";
import "../scss/MappingView.scss";

import DragHandleIcon from "@mui/icons-material/DragHandle";
import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "@mui/material/Tooltip";

const MappingView: FC = () => {
  const indexMapping = useStore((state) => state.indexMapping);
  const columnOrder = useStore((state) => state.columnOrder);
  const setColumnOrder = useStore((state) => state.setColumnOrder);
  const nonVisibleFields = useStore((state) => state.nonVisibleFields);
  const setNonVisibleFields = useStore((state) => state.setNonVisibleFields);
  const hiddenVizFields = useStore((state) => state.hiddenVizFields);
  const setHiddenVizFields = useStore((state) => state.setHiddenVizFields);
  const nonFilterableFields = useStore((state) => state.nonFilterableFields);
  const setNonFilterableFields = useStore((state) => state.setNonFilterableFields);
  const [disabled, setDisabled] = useState(true);

  const mapping: any = useMemo(() => {
    let mapping = indexMapping.mapping;
    return mapping && Object.entries(mapping).length
      ? (Object.entries(mapping) as any)[0][1]["mappings"]["properties"]
      : {};
  }, [indexMapping]);

  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [deselectCheckedVisualizable, setDeselectCheckedVisualizable] = useState<boolean>(false);
  const [deselectCheckedFilterable, setDeselectCheckedFilterable] = useState<boolean>(false);
  const [deselectCheckedVisible, setDeselectCheckedVisible] = useState<boolean>(false);

  return (
    <div>
      <div className="mapping-tags">
        <div className="page-title">
          <h1>
            Configure Mapping
            <Tooltip title="Configure your search results view. Drag to change column order.">
              <HelpIcon />
            </Tooltip>
          </h1>
        </div>

        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
          <div style={{ padding: " 2px", width: "65%", margin: "0 auto" }}>
            <div className="mapping">
              <div className="deselect-main-card">
                <div className="mapping-cell">
                  <div>
                    <div className="title-and-toggles">
                      <div className="key-info">
                        <div className="field-names"></div>
                      </div>

                      <div className="toggles">
                        <div className="individual-toggle">
                          {!deselectCheckedVisualizable ? <>Deselect all</> : <>Select all</>}
                          <Switch
                            {...label}
                            checked={!deselectCheckedVisualizable}
                            color="warning"
                            onClick={(e) => {
                              if (!deselectCheckedVisualizable) {
                                setHiddenVizFields(columnOrder);
                              } else {
                                setHiddenVizFields([]);
                              }
                              setDeselectCheckedVisualizable(!deselectCheckedVisualizable);
                            }}
                          />
                        </div>
                        <div className="individual-toggle">
                          {!deselectCheckedFilterable ? <>Deselect all</> : <>Select all</>}
                          <Switch
                            {...label}
                            checked={!deselectCheckedFilterable}
                            color="warning"
                            onClick={(e) => {
                              if (!deselectCheckedFilterable) {
                                setNonFilterableFields(columnOrder);
                              } else {
                                setNonFilterableFields([]);
                              }
                              setDeselectCheckedFilterable(!deselectCheckedFilterable);
                            }}
                          />
                        </div>
                        <div className="individual-toggle">
                          {!deselectCheckedVisible ? <>Deselect all</> : <>Select all</>}
                          <Switch
                            {...label}
                            checked={!deselectCheckedVisible}
                            color="warning"
                            onClick={(e) => {
                              if (!deselectCheckedVisible) {
                                setNonVisibleFields(columnOrder);
                              } else {
                                setNonVisibleFields([]);
                              }
                              setDeselectCheckedVisible(!deselectCheckedVisible);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="deselect-grip-bar-spacer">
                <DragHandleIcon fontSize="small" style={{ cursor: "pointer", color: "rgba(0, 0, 0, 0.0)" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: " 2px", width: "65%", margin: "0 auto" }}>
          <Reorder
            reorderId="mappings"
            disabled={disabled}
            onReorder={(event: any, previousIndex: number, nextIndex: number, fromId: any, toId: any) => {
              let newColumnOrder = reorder(columnOrder, previousIndex, nextIndex);
              setColumnOrder(newColumnOrder);
            }}
            draggedClassName="dragged"
            placeholderClassName="mapping-placeholder"
          >
            {columnOrder.map((fieldName: string, i: number) => {
              let fieldProps = mapping[fieldName];
              return (
                <div className="mapping">
                  <div className="main-card">
                    <div className="mapping-cell">
                      <div>
                        <div className="title-and-toggles">
                          <div className="key-info">
                            <b>
                              {i}: {fieldName}
                            </b>
                            <div className="field-names">
                              {Object.entries(fieldProps).map(
                                ([fieldPropName, fieldPropValue]: [fieldPropName: string, fieldPropValue: any]) => {
                                  return (
                                    <div className="field-names-row">
                                      <b style={{ whiteSpace: "pre" }}>{fieldPropName}:</b>
                                      <span>{JSON.stringify(fieldPropValue)}</span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          <div className="toggles">
                            <div className="individual-toggle">
                              Visualizable
                              <Switch
                                {...label}
                                checked={!hiddenVizFields.includes(fieldName)}
                                color="warning"
                                onClick={(e) => {
                                  if (!hiddenVizFields.includes(fieldName)) {
                                    setHiddenVizFields([fieldName, ...hiddenVizFields]);
                                  } else {
                                    setHiddenVizFields(
                                      hiddenVizFields.filter((hiddenVizFieldsName) => hiddenVizFieldsName !== fieldName)
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="individual-toggle">
                              Filterable
                              <Switch
                                {...label}
                                checked={!nonFilterableFields.includes(fieldName)}
                                color="warning"
                                onClick={(e) => {
                                  if (!nonFilterableFields.includes(fieldName)) {
                                    setNonFilterableFields([fieldName, ...nonFilterableFields]);
                                  } else {
                                    setNonFilterableFields(
                                      nonFilterableFields.filter(
                                        (nonFilterableFieldsName) => nonFilterableFieldsName !== fieldName
                                      )
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="individual-toggle">
                              Visible
                              <Switch
                                {...label}
                                checked={!nonVisibleFields.includes(fieldName)}
                                color="warning"
                                onClick={(e) => {
                                  if (!nonVisibleFields.includes(fieldName)) {
                                    setNonVisibleFields([fieldName, ...nonVisibleFields]);
                                  } else {
                                    setNonVisibleFields(
                                      nonVisibleFields.filter((visibleFieldName) => visibleFieldName !== fieldName)
                                    );
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="grip-bar"
                    onMouseEnter={() => {
                      setDisabled(false);
                    }}
                    onMouseLeave={() => setDisabled(true)}
                  >
                    <DragHandleIcon
                      fontSize="small"
                      style={{ cursor: "pointer", color: "white", paddingTop: "10px" }}
                    />
                  </div>
                </div>
              );
            })}
          </Reorder>
        </div>
      </div>
    </div>
  );
};

export default MappingView;
