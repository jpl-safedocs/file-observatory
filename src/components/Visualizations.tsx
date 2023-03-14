/**
 * Copyright (c) 2018-2023 California Institute of Technology ("Caltech"). U.S.
 * Government sponsorship acknowledged.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Caltech nor its operating division, the Jet Propulsion
 *   Laboratory, nor the names of its contributors may be used to endorse or
 *   promote products derived from this software without specific prior written
 *   permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { FC, useMemo, useState, ReactElement } from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import useStore from "../utils/store";

import DataViz from "./VisualizationTabs/DataViz";
import SigTerms from "./VisualizationTabs/SigTerms";
import Kibana from "./VisualizationTabs/Kibana";
import HexEditor from "./VisualizationTabs/HexEditor";
import GeoSpatial from "./VisualizationTabs/GeoSpatial";

import "../scss/Visualizations.scss";
import CrashViz from "./VisualizationTabs/CrashViz";

export type ActiveIndexProps = {
  index: number;
  permanent: boolean;
  fill?: string;
};

interface TabLabelProps {
  label: string;
  icon?: JSX.Element | null;
}
const TabLabel: FC<TabLabelProps> = ({ label, icon }) => (
  <span style={{ display: "flex", alignItems: "center" }}>
    {label}
    {icon}
  </span>
);

interface VisualizationTabsProps {
  activeViz: string;
  setActiveViz: (viz: string) => void;
  launchNewWindow: () => void;
}

const VisualizationTabs: FC<VisualizationTabsProps> = ({ activeViz, setActiveViz, launchNewWindow }) => {
  const launchableTabs = ["Kibana"];
  return (
    <Tabs
      className="viz-tabs"
      value={activeViz}
      onChange={(_, value) => {
        setActiveViz(value);
      }}
      style={{ color: "white" }}
      textColor="inherit"
      aria-label="Visualization Tabs"
    >
      {[
        "Data Viz",
        "Sig Terms",
        "Crash Viz",
        "Hex Editor",
        //  "X-Ref Tool",
        "Geospatial",
        "Kibana",
      ].map((label: string) => {
        return (
          <Tab
            key={label}
            value={label}
            label={
              <TabLabel
                label={label}
                icon={
                  activeViz === label && launchableTabs.includes(label) ? (
                    <OpenInNewIcon fontSize="small" style={{ margin: "2px", marginTop: 0 }} />
                  ) : null
                }
              />
            }
            id={`viz-${label}`}
            aria-controls={`viz-${label}`}
            onClick={() => {
              if (label === activeViz) {
                launchNewWindow();
              }
            }}
          />
        );
      })}
    </Tabs>
  );
};

interface VisualizationBodyProps {
  activeViz: string;
  hiddenIndices: number[];
  setHiddenIndices: (hiddenIndices: number[]) => void;
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const VisualizationBody: FC<VisualizationBodyProps> = ({
  activeViz,
  hiddenIndices,
  setHiddenIndices,
  activeIndices,
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  const visualizations: Record<string, ReactElement> = {
    "Data Viz": (
      <DataViz
        hiddenIndices={hiddenIndices}
        setHiddenIndices={setHiddenIndices}
        activeIndices={activeIndices}
        removeNonPermanentIndices={removeNonPermanentIndices}
        togglePermanentIndex={togglePermanentIndex}
        hoverIndex={hoverIndex}
      />
    ),
    "Sig Terms": (
      <SigTerms
        hiddenIndices={hiddenIndices}
        setHiddenIndices={setHiddenIndices}
        activeIndices={activeIndices}
        removeNonPermanentIndices={removeNonPermanentIndices}
        togglePermanentIndex={togglePermanentIndex}
        hoverIndex={hoverIndex}
      />
    ),
    "Crash Viz": <CrashViz />,
    "Hex Editor": <HexEditor />,
    // "X-Ref Tool": <div>X-Ref Tool</div>,
    Geospatial: <GeoSpatial />,
    Kibana: <Kibana />,
  };
  return visualizations[activeViz] || <div>No Visualization Selected</div>;
};

interface DataTableProps {
  label: string;
  data: any[];
  style?: any;
  className?: string;
  hiddenIndices?: number[];
  setHiddenIndices?: (indices: number[]) => void;
  activeIndices?: ActiveIndexProps[];
  labelField?: string;
  dataFields?: string[];
  removeNonPermanentIndices?: (index: number) => void;
  togglePermanentIndex?: (index: number) => void;
  hoverIndex?: (index: number) => void;
}

const DataTable: FC<DataTableProps> = ({
  label,
  data,
  style,
  className,
  hiddenIndices = [],
  setHiddenIndices,
  activeIndices = [],
  labelField = "label",
  dataFields = ["count"],
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  return (
    <div style={style} className={"data-table-wrapper" + (className ? ` ${className}` : "")}>
      <table className="data-table">
        <thead>
          <tr>
            <th>{label}</th>
            {dataFields.map((fieldName) => (
              <th key={`data-field-${fieldName}`}>{fieldName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row: any, i: number) => {
              const isHidden = hiddenIndices.includes(i);
              return (
                <tr key={`${labelField}-tr-${i}`}>
                  <td
                    onMouseOver={() => hoverIndex && hoverIndex(i)}
                    onMouseLeave={() => removeNonPermanentIndices && removeNonPermanentIndices(i)}
                    onMouseDown={() => {
                      if (setHiddenIndices) {
                        if (isHidden) {
                          setHiddenIndices(hiddenIndices.filter((idx) => idx !== i));
                        } else {
                          setHiddenIndices([...hiddenIndices, i]);
                        }
                      }
                    }}
                    style={{ cursor: togglePermanentIndex ? "pointer" : "default", color: isHidden ? "grey" : "black" }}
                  >
                    {row[labelField].length > 15 ? (
                      <Tooltip title={row[labelField]}>
                        <span
                          style={{ display: "flex", width: "100px", maxWidth: "100px", overflow: "scroll" }}
                          className="long-label"
                        >
                          {row[labelField]}
                        </span>
                      </Tooltip>
                    ) : (
                      row[labelField]
                    )}
                  </td>
                  {dataFields.map((fieldName) => (
                    <td key={`${fieldName}-data-field`}>{row[fieldName]}</td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr style={{ textAlign: "center", color: "#4d5465", fontWeight: "bold", padding: "15px" }}>
              <td style={{ textAlign: "center" }}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Visualizations: FC = () => {
  const [activeViz, setActiveViz] = useStore((state) => [state.activeViz, state.setActiveViz]);
  const suggestions = useStore((state) => state.suggestions);
  const completions = useStore((state) => state.completions);
  const filterList = useStore((state) => state.filterList);
  const completionFields = useStore((state) => state.completionFields);
  const completionField = useStore((state) => state.completionField);
  const setCompletionField = useStore((state) => state.setCompletionField);
  const suggestionField = useStore((state) => state.suggestionField);
  const setSuggestionField = useStore((state) => state.setSuggestionField);
  const aggregations = useStore((state) => state.aggregations);
  const activeField = useStore((state) => state.activeField);
  const sigTerms = useStore((state) => state.sigTerms);
  const sigTermsField = useStore((state) => state.sigTermsField);
  const kibanaURL = useStore((state) => state.kibanaURL);
  const crashField = useStore((state) => state.crashField);
  const creatorTool = useStore((state) => state.creatorTool);
  const creatorToolName = useStore((state) => state.creatorToolName);
  // const fetchDocuments = useStore((state) => state.fetchDocuments);

  const [activeIndices, setActiveIndices] = useState<ActiveIndexProps[]>(
    [0, 2, 4].map((i) => ({ index: i, permanent: true }))
  );

  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);

  const removeNonPermanentIndices = (index: number) => {
    setActiveIndices(
      activeIndices
        .filter((active) => active.index !== index || active.permanent)
        .map((active) => ({
          index: active.index,
          permanent: active.permanent,
        }))
    );
  };

  const togglePermanentIndex = (index: number) => {
    if (
      !activeIndices
        .filter((i) => i.permanent)
        .map((i) => i.index)
        .includes(index)
    ) {
      setActiveIndices([...activeIndices, { index: index, permanent: true }]);
    } else {
      setActiveIndices(activeIndices.filter((active) => active.index !== index));
    }
  };

  const hoverIndex = (index: number) => {
    if (!activeIndices.map((i) => i.index).includes(index)) {
      setActiveIndices([
        ...activeIndices.filter((i) => i.permanent),
        { index: index, permanent: false, fill: "lightblue" },
      ]);
    } else {
      setActiveIndices(
        activeIndices.map((i) => ({
          index: i.index,
          permanent: i.permanent,
          fill: i.index === index ? "lightblue" : i.fill,
        }))
      );
    }
  };

  const formattedSuggestions = useMemo(() => {
    if (!suggestions || !Object.keys(suggestions).length) return [];
    return Object.entries(suggestions.documents.aggregations).map(([term, meta]: [term: string, meta: any]) => ({
      label: term,
      count: meta.doc_count,
    }));
  }, [suggestions]);

  const formattedCompletions = useMemo(() => {
    return completions.map((completion) => ({ label: completion.completion, count: completion.count }));
  }, [completions]);

  const [fieldCountLabel, fieldCountData] = useMemo(() => {
    let fieldCountData = [];
    let fieldCountLabel = "";
    if (["Sig Terms"].includes(activeViz) && sigTerms && sigTerms.my_sample && sigTermsField) {
      fieldCountLabel = sigTermsField;
      fieldCountData = sigTerms.my_sample.keywords.buckets.map((bucket: any) => ({
        label: bucket.key,
        doc_count: bucket.doc_count,
        score: bucket.score,
        bg_count: bucket.bg_count,
      }));
    } else if (activeViz === "Crash Viz" && crashField && creatorTool && creatorToolName) {
      fieldCountLabel = "Crash Viz";
      fieldCountData = [];
    } else if (!["Sig Terms"].includes(activeViz) && activeField && aggregations[activeField]) {
      fieldCountLabel = activeField;
      fieldCountData = aggregations[activeField].buckets.map((bucket: any) => ({
        label: bucket.key,
        count: bucket.doc_count,
      }));
    }

    return [fieldCountLabel, fieldCountData];
  }, [aggregations, activeField, activeViz, sigTerms, sigTermsField, crashField, creatorTool, creatorToolName]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <VisualizationTabs
        activeViz={activeViz}
        launchNewWindow={() => {
          if (activeViz === "Kibana") {
            window.open(kibanaURL, "_blank", "width=1000,height=800,frame=true,nodeIntegration=no");
          }
        }}
        setActiveViz={(viz) => {
          setActiveViz(viz);
          setHiddenIndices([]);
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 2, background: "white" }}>
          <VisualizationBody
            hiddenIndices={hiddenIndices}
            setHiddenIndices={setHiddenIndices}
            activeViz={activeViz}
            activeIndices={activeIndices}
            removeNonPermanentIndices={removeNonPermanentIndices}
            togglePermanentIndex={togglePermanentIndex}
            hoverIndex={hoverIndex}
          />
        </div>
        <div style={{ flex: 1, display: "flex", maxHeight: "45px", background: "white" }}>
          <div style={{ flex: 1 }}>
            <Button disabled={hiddenIndices.length === 0} onClick={() => setHiddenIndices([])}>
              Reset
            </Button>
            <Button
              disabled={!aggregations[activeField] || aggregations[activeField].buckets.length === 0}
              onClick={() => {
                const length: number = aggregations[activeField] ? aggregations[activeField].buckets.length : 0;
                let indices: number[] = [];
                for (let i = 0; i < length; i++) {
                  indices.push(i);
                }
                setHiddenIndices(indices);
              }}
            >
              Hide All
            </Button>
          </div>
          {activeViz === "Data Viz" && (
            <>
              <div style={{ flex: 1 }} className="table-select-field">
                <FormControl>
                  <InputLabel id="similarity-field-select">Similarity Field</InputLabel>
                  <Select
                    labelId="similarity-field-select"
                    id="similarity-field-select"
                    value={filterList && filterList.includes(suggestionField) ? suggestionField : ""}
                    placeholder="Similarity Field"
                    label="Similarity Field"
                    onChange={(evt) => {
                      setSuggestionField(evt.target.value as string);
                    }}
                    style={{ margin: "5px" }}
                  >
                    {filterList.map((filter) => (
                      <MenuItem key={`sim-filter-${filter}`} value={filter}>
                        {filter}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div style={{ flex: 1 }} className="table-select-field">
                <FormControl>
                  <InputLabel id="completion-field-select">Completion Field</InputLabel>
                  <Select
                    labelId="completion-field-select"
                    id="completion-field-select"
                    value={completionFields && completionFields.includes(completionField) ? completionField : ""}
                    placeholder="Completion Field"
                    label="Completion Field"
                    onChange={(evt) => {
                      setCompletionField(evt.target.value as string);
                    }}
                    style={{ margin: "5px" }}
                  >
                    {completionFields.map((field) => (
                      <MenuItem key={`completion-field-${field}`} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </>
          )}
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          <DataTable
            className="field-count-table"
            style={{ flex: 1 }}
            label={fieldCountLabel}
            data={fieldCountData}
            dataFields={activeViz === "Sig Terms" ? ["doc_count", "bg_count", "score"] : ["count"]}
            hiddenIndices={hiddenIndices}
            setHiddenIndices={setHiddenIndices}
            activeIndices={activeIndices}
            removeNonPermanentIndices={removeNonPermanentIndices}
            togglePermanentIndex={togglePermanentIndex}
            hoverIndex={hoverIndex}
          />
          {activeViz === "Data Viz" && (
            <>
              <DataTable style={{ flex: 1 }} label="Similar Tokens" data={formattedSuggestions} />
              <DataTable style={{ flex: 1 }} label="Completion" data={formattedCompletions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
