import { FC, useEffect, useState, useMemo } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

import useStore from "../../utils/store";

import DonutChart from "./DonutChart";
import BarChart from "./BarChart";
import Treemap from "./Treemap";
import ScatterPlot from "./ScatterPlot";

import { ActiveIndexProps } from "../Visualizations";

interface DataVizProps {
  hiddenIndices: number[];
  setHiddenIndices: (indices: number[]) => void;
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const DataViz: FC<DataVizProps> = ({
  hiddenIndices,
  setHiddenIndices,
  activeIndices,
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  const aggregations = useStore((state) => state.aggregations);
  const [vizType, setVizType] = useState<string>("donut");
  const [activeField, setActiveField] = useStore((state) => [state.activeField, state.setActiveField]);
  const [activeYField, setActiveYField] = useStore((state) => [state.activeYField, state.setActiveYField]);
  const [activeColorField, setActiveColorField] = useStore((state) => [state.activeColorField, state.setActiveColorField]);
  const [activeSampleSize, setActiveSampleSize] = useStore((state) => [state.activeSampleSize, state.setActiveSampleSize]);
  const hiddenVizFields = useStore((state) => state.hiddenVizFields);
  const allMappingFields = useStore((state) => state.allMappingFields);
  const documents = useStore((state) => state.documents);
  const fetchPlotData = useStore((state) => state.fetchPlotData);

  const visualizableFields = useMemo(() => {
    return allMappingFields.filter((filterItem) => !hiddenVizFields.includes(filterItem));
  }, [allMappingFields, hiddenVizFields]);

  const [agg, setAgg] = useState<Record<string, any>>({
    field: "field",
    filter: [],
    topLabel: "Top 10",
    bottomLabel: "fields",
    tableLabel: "field",
    toolTipFieldLabel: "field",
    toolTipCountLabel: "count",
  });

  useEffect(() => {
    if ((visualizableFields.length > 0 && activeField === "") || !visualizableFields.includes(activeField)) {
      setActiveField(visualizableFields[0]);
      setHiddenIndices([]);
      setAgg({
        field: visualizableFields[0],
        filter: [],
        topLabel: "Top 10",
        bottomLabel: visualizableFields[0],
        tableLabel: visualizableFields[0],
        toolTipFieldLabel: "field",
        toolTipCountLabel: "count",
      });
    }
  }, [visualizableFields, activeField, setActiveField, setHiddenIndices]);

  return (
    <div style={{ marginTop: "10px" }}>
      <FormControl>
        <InputLabel id="viz-type-label">Viz Type</InputLabel>
        <Select
          id="viz-type-select"
          labelId="viz-type-label"
          value={vizType || "donut"}
          label="Viz Type"
          onChange={(evt) => {
            setVizType(evt.target.value);
            if (evt.target.value !== "scatter") {
              setActiveYField("count");
              setActiveColorField("auto");
              setActiveSampleSize(-1);
            }
          }}
          style={{ margin: "5px" }}
        >
          <MenuItem value="donut">Donut</MenuItem>
          <MenuItem value="barchart">Bar Chart</MenuItem>
          <MenuItem value="treemap">Treemap</MenuItem>
          <MenuItem value="scatter">Scatter Plot</MenuItem>
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "100px" }}>
        <InputLabel id="viz-field-label">X Field</InputLabel>
        <Select
          id="keyword-field-select"
          labelId="viz-field-label"
          value={activeField && visualizableFields.includes(activeField) ? activeField : ""}
          label="X Field"
          onChange={(evt) => {
            setActiveField(evt.target.value);
            setHiddenIndices([]);
            setAgg({
              field: evt.target.value,
              filter: [],
              topLabel: "Top 10",
              bottomLabel: evt.target.value.replace(".keyword", ""),
              tableLabel: evt.target.value.replace(".keyword", ""),
              toolTipFieldLabel: "field",
              toolTipCountLabel: "count",
            });
          }}
          style={{ margin: "5px" }}
        >
          {visualizableFields.map((filter) => (
            <MenuItem key={`viz-field-${filter}`} value={filter}>
              {filter}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "100px" }}>
        <InputLabel id="viz-y-field-label">Y Field</InputLabel>
        <Select
          id="keyword-y-field-select"
          labelId="viz-y-field-label"
          value={activeYField && ["count", ...visualizableFields].includes(activeYField) ? activeYField : ""}
          disabled={vizType !== "scatter"}
          label="Y Field"
          onChange={(evt) => {
            if (activeYField === "count" && activeColorField === "auto") {
              setActiveSampleSize(100);
            } else if (evt.target.value === "count" && activeColorField === "auto") {
              setActiveSampleSize(-1);
            }
            setActiveYField(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          <MenuItem value="count">
            Count
          </MenuItem>
          {visualizableFields.map((filter) => (
            <MenuItem key={`viz-y-field-${filter}`} value={filter}>
              {filter}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "100px" }}>
        <InputLabel id="viz-color-field-label">Color Field</InputLabel>
        <Select
          id="color-field-select"
          labelId="viz-color-field-label"
          value={activeColorField && ["auto", ...visualizableFields].includes(activeColorField) ? activeColorField : ""}
          disabled={vizType !== "scatter"}
          label="Color Field"
          onChange={(evt) => {
            if (activeYField === "count" && activeColorField === "auto") {
              setActiveSampleSize(100);
            } else if (evt.target.value === "auto" && activeYField === "count") {
              setActiveSampleSize(-1);
            }
            setActiveColorField(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          <MenuItem value="auto">
            Auto
          </MenuItem>
          {visualizableFields.map((filter) => (
            <MenuItem key={`viz-color-field-${filter}`} value={filter}>
              {filter}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "100px" }}>
        <InputLabel id="viz-sample-size-label">Sample Size</InputLabel>
        <Select
          id="sample-size-select"
          labelId="viz-sample-size-label"
          value={activeYField === "count" && activeColorField === "auto" ? -1 : activeSampleSize}
          disabled={vizType !== "scatter" || (activeYField === "count" && activeColorField === "auto")}
          label="Sample Size"
          onChange={(evt) => {
            setActiveSampleSize(evt.target.value as number);
            fetchPlotData([activeField, activeYField, activeColorField].filter(field => !["count", "auto"].includes(field)));
          }}
          style={{ margin: "5px" }}
        >
          {![documents.length, 100, 1000, -1].includes(activeSampleSize) && <MenuItem value={activeSampleSize}>{activeSampleSize}</MenuItem>}
          <MenuItem value={documents.length}>{documents.length}</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value={1000}>1000</MenuItem>
          <MenuItem value={-1} hidden={true} disabled>All</MenuItem>
        </Select>
      </FormControl>
      <div>
        {aggregations[activeField] && (
          <>
            {vizType === "donut" && (
              <DonutChart
                agg={agg}
                hiddenIndices={hiddenIndices}
                data={aggregations[activeField]}
                activeIndices={activeIndices}
                removeNonPermanentIndices={removeNonPermanentIndices}
                togglePermanentIndex={togglePermanentIndex}
                hoverIndex={hoverIndex}
              />
            )}
            {vizType === "barchart" && (
              <BarChart
                agg={agg}
                hiddenIndices={hiddenIndices}
                data={aggregations[activeField]}
                activeIndices={activeIndices}
                removeNonPermanentIndices={removeNonPermanentIndices}
                togglePermanentIndex={togglePermanentIndex}
                hoverIndex={hoverIndex}
              />
            )}
            {vizType === "treemap" && (
              <Treemap
                agg={agg}
                hiddenIndices={hiddenIndices}
                data={aggregations[activeField]}
                activeIndices={activeIndices}
                removeNonPermanentIndices={removeNonPermanentIndices}
                togglePermanentIndex={togglePermanentIndex}
                hoverIndex={hoverIndex}
              />
            )}
          </>
        )}
        {vizType === "scatter" && (
          <ScatterPlot
            agg={agg}
            hiddenIndices={hiddenIndices}
            data={aggregations[activeField]}
            activeIndices={activeIndices}
            removeNonPermanentIndices={removeNonPermanentIndices}
            togglePermanentIndex={togglePermanentIndex}
            hoverIndex={hoverIndex}
          />
        )}
      </div>
    </div>
  );
};

export default DataViz;
