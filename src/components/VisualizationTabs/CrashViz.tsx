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

import { FC, useMemo } from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CrashBarChart from "./CrashBarChart";

import useStore from "../../utils/store";

const CrashViz: FC = () => {
  const allMappingFields = useStore((state) => state.allMappingFields);
  const [crashField, setCrashField] = useStore((state) => [state.crashField, state.setCrashField]);
  const [creatorTool, setCreatorTool] = useStore((state) => [state.creatorTool, state.setCreatorTool]);
  const [creatorToolName, setCreatorToolName] = useStore((state) => [state.creatorToolName, state.setCreatorToolName]);
  const [crashMetricName, setCrashMetricName] = useStore((state) => [state.crashMetricName, state.setCrashMetricName]);
  const documents = useStore((state) => state.documents);
  const crashData = useMemo(() => {
    if (!crashField || !creatorTool || !documents) {
      return [];
    }
    const crash_counts_dict: { [key: string]: any } = {};
    documents.forEach((doc) => {
      let tool = doc["_source"][creatorTool] || "";
      let crashes = doc["_source"][crashField] || "";
      let crashes_list = crashes.split(" ");
      crash_counts_dict[tool] = crash_counts_dict[tool] || {};

      crashes_list.forEach((pt_crash: string) => {
        let parser_tool = pt_crash.split("_")[0];
        let crash_bool = pt_crash.split("_")[1];
        crash_counts_dict[tool][parser_tool] = crash_counts_dict[tool][parser_tool] || 0;
        if (crash_bool === "crash") {
          crash_counts_dict[tool][parser_tool] += 1;
        }
      });
    });

    const percentages_dict: { [key: string]: any } = {};
    Object.entries(crash_counts_dict).forEach(([c_tool, counts_dict]) => {
      let total: any = Object.entries(counts_dict)
        .map(([key, value]) => value)
        .reduce((prev: any, curr: any) => prev + curr);
      percentages_dict[c_tool] = percentages_dict[c_tool] || {};
      Object.entries(counts_dict)
        .filter(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => sub_key !== "TOTAL")
        .forEach(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => {
          percentages_dict[c_tool][sub_key] = (sub_value / total) * 100.0;
          if (sub_value === 0) {
            percentages_dict[c_tool][sub_key] = 0;
          }
        });
    });
    return percentages_dict;
  }, [documents, crashField, creatorTool]);

  const creatorToolsNames = useMemo(() => {
    return Object.keys(crashData);
  }, [crashData]);

  const chisqData = useMemo(() => {
    if (!crashField || !creatorTool || !documents) {
      return [];
    }
    const observed: { [key: string]: any } = {};
    const expected: { [key: string]: any } = {};
    const total_crashes: { [key: string]: any } = {};
    documents.forEach((doc) => {
      let tool = doc["_source"][creatorTool];
      let crashes = doc["_source"][crashField];
      if (!tool || !crashes) {
        return;
      }
      let crashes_list = crashes.split(" ");
      observed[tool] = observed[tool] || {};

      crashes_list.forEach((pt_crash: string) => {
        let parser_tool = pt_crash.split("_")[0];
        let crash_bool = pt_crash.split("_")[1];
        observed[tool][parser_tool] = observed[tool][parser_tool] || 0;
        if (crash_bool === "crash") {
          observed[tool][parser_tool] += 1;
        }
        total_crashes[parser_tool] = total_crashes[parser_tool] ? total_crashes[parser_tool] : 0;
        total_crashes[parser_tool] += observed[tool][parser_tool];
      });
    });

    const observed_percentage: { [key: string]: any } = {};
    Object.entries(observed).forEach(([ct, counts_dict]) => {
      observed_percentage[ct] = observed_percentage[ct] || {};
      let total: any = Object.entries(counts_dict)
        .map(([key, value]) => value)
        .reduce((prev: any, curr: any) => prev + curr);
      expected[ct] = expected[ct] || {};
      Object.entries(counts_dict)
        .filter(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => sub_key !== "TOTAL")
        .forEach(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => {
          expected[ct][sub_key] = expected[ct][sub_key] || {};
          observed_percentage[ct][sub_key] = (sub_value / total) * 100.0;
          if (sub_value === 0) {
            observed_percentage[ct][sub_key] = 0;
          }
          let pc = total_crashes[sub_key] / documents.length;
          expected[ct][sub_key] = pc * total;
        });
    });

    const chisq: { [key: string]: any } = {};
    Object.entries(observed).forEach(([ct, counts_dict]) => {
      chisq[ct] = chisq[ct] || {};

      Object.entries(counts_dict)
        .filter(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => sub_key !== "TOTAL")
        .forEach(([sub_key, sub_value]: [sub_key: string, sub_value: any]) => {
          if (!expected[ct][sub_key] || [null, undefined].includes(observed[ct][sub_key])) {
            chisq[ct][sub_key] = 0;
          }
          chisq[ct][sub_key] = Math.pow(observed[ct][sub_key] - expected[ct][sub_key], 2) / expected[ct][sub_key];
        });
    });
    console.log(chisq);
    return chisq;
  }, [documents, crashField, creatorTool]);

  const chartData = useMemo(() => {
    if (crashMetricName === "Frequency") {
      return crashData;
    } else if (crashMetricName === "Chi Square") {
      return chisqData;
    } else {
      return [];
    }
  }, [crashMetricName, crashData, chisqData]);

  return (
    <div style={{ marginTop: "10px" }}>
      <FormControl style={{ minWidth: "200px" }}>
        <InputLabel id="crash-metric-label">Crash Metric</InputLabel>
        <Select
          id="crash-metric-select"
          value={crashMetricName}
          label="Crash Metric"
          labelId="crash-metric-name"
          onChange={(evt) => {
            setCrashMetricName(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          {["Frequency Percentages", "Chi Square"].map((field) => (
            <MenuItem key={`crash-metric-${field}`} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "200px" }}>
        <InputLabel id="crash-field-label">Crash Field</InputLabel>
        <Select
          id="crash-field-select"
          value={crashField && allMappingFields.includes(crashField) ? crashField : ""}
          label="Crash Field"
          labelId="crash-field-label"
          onChange={(evt) => {
            setCrashField(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          {allMappingFields.map((field) => (
            <MenuItem key={`crash-field-${field}`} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "200px" }}>
        <InputLabel id="creator-tool-label">Creator Tool Field</InputLabel>
        <Select
          id="creator-tool-select"
          value={creatorTool && allMappingFields.includes(creatorTool) ? creatorTool : ""}
          label="Crash Field"
          labelId="creator-tool-label"
          onChange={(evt) => {
            setCreatorTool(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          {allMappingFields.map((field) => (
            <MenuItem key={`creator-tool-${field}`} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: "200px" }}>
        <InputLabel id="creator-tool-name">Creator Tool Name</InputLabel>
        <Select
          id="creator-tool-name-select"
          value={creatorToolName}
          label="Creator Tool Name Field"
          labelId="creator-tool-name"
          disabled={!creatorTool || creatorToolsNames.length === 0}
          onChange={(evt) => {
            setCreatorToolName(evt.target.value);
          }}
          style={{ margin: "5px" }}
        >
          {creatorToolsNames.map((field) => (
            <MenuItem key={`creator-name-${field}`} value={field}>
              {field}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div>
        <CrashBarChart data={chartData} creatorToolName={creatorToolName} />
      </div>
    </div>
  );
};

export default CrashViz;
