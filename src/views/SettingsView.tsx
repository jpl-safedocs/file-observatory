import { FC, useEffect, useState, useMemo, forwardRef } from "react";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import FormHelperText from "@mui/material/FormHelperText";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Snackbar from "@mui/material/Snackbar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";

import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import Reorder, { reorder } from "react-reorder";

import useStore from "../utils/store";

import "../scss/SettingsView.scss";

// @ts-ignore
const { ipcRenderer } = window.require("electron");

const package_json = require("../../package.json");

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface SearchSelectProps {
  onDeleteOption: (item: string) => void;
  value: string;
  options: any[];
  onChange: (newValue: string) => void;
  itemName?: string;
  label?: string;
  className?: string;
  style?: any;
}

const SearchSelect: FC<SearchSelectProps> = ({
  onDeleteOption,
  value,
  options,
  onChange,
  itemName = "index",
  label = "ElasticSearch Index",
  className = "",
  style = {},
}) => {
  const filter = createFilterOptions();

  return (
    <Autocomplete
      className={className}
      style={{ width: "100%", ...style }}
      freeSolo
      // @ts-ignore
      filterOptions={(options, params) => {
        // @ts-ignore
        const filtered = filter(options, params);

        const { inputValue } = params;
        const isExisting = options.some((option) => inputValue === option.title);
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            title: `Add "${inputValue}" ${itemName}`,
          });
        }

        return filtered;
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.inputValue) {
          return option.inputValue;
        }
        return option.title;
      }}
      renderOption={(props, option) => (
        <span style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <li {...props} style={{ flex: 1 }}>
            {option.title}
          </li>
          <span className="delete-index-btn" style={{ position: "absolute", right: "5px" }}>
            <ClearIcon onClick={() => onDeleteOption(option.inputValue)} />
          </span>
        </span>
      )}
      value={value}
      options={options}
      renderInput={(params) => <TextField {...params} variant="outlined" label={label} />}
      onChange={(evt, newValue) => {
        if (newValue && (newValue as any)["inputValue"]) {
          let validNewValue = (newValue as any)["inputValue"] as string;
          onChange(validNewValue);
        }
      }}
    />
  );
};

const SettingsView: FC = () => {
  const [elasticSearchURL, setElasticSearchURL] = useStore((state) => [state.esURL, state.setEsURL]);
  const [esAPI, setEsAPI] = useStore((state) => [state.esAPI, state.setEsAPI]);
  const [useEsAPI, setUseEsAPI] = useStore((state) => [state.useEsAPI, state.setUseEsAPI]);
  const [downloadAPI, setDownloadAPI] = useStore((state) => [state.downloadAPI, state.setDownloadAPI]);
  const [rawFileLocation, setRawFileLocation] = useStore((state) => [state.rawFileLocation, state.setRawFileLocation]);
  const [useRawFileLocation, setUseRawFileLocation] = useStore((state) => [
    state.useRawFileLocation,
    state.setUseRawFileLocation,
  ]);
  const [elasticSearchIndex, setElasticSearchIndex] = useStore((state) => [state.index, state.setIndex]);
  const [kibanaURL, setKibanaURL] = useStore((state) => [state.kibanaURL, state.setKibanaURL]);
  const [sigTermsField, setSigTermsField] = useStore((state) => [state.sigTermsField, state.setSigTermsField]);
  const [suggestionField, setSuggestionField] = useStore((state) => [state.suggestionField, state.setSuggestionField]);
  const [completionField, setCompletionField] = useStore((state) => [state.completionField, state.setCompletionField]);
  const [downloadPath, setDownloadPath] = useStore((state) => [state.downloadPath, state.setDownloadPath]);
  const [downloadPathField, setDownloadPathField] = useStore((state) => [
    state.downloadPathField,
    state.setDownloadPathField,
  ]);
  const allMappingFields = useStore((state) => state.allMappingFields);
  const [geoSpatialField, setGeoSpatialField] = useStore((state) => [state.geoSpatialField, state.setGeoSpatialField]);
  const [nonVisibleFields, setNonVisibleFields] = useStore((state) => [
    state.nonVisibleFields,
    state.setNonVisibleFields,
  ]);

  const [hiddenVizFields, setHiddenVizFields] = useStore((state) => [state.hiddenVizFields, state.setHiddenVizFields]);
  const [nonFilterableFields, setNonFilterableFields] = useStore((state) => [
    state.nonFilterableFields,
    state.setNonFilterableFields,
  ]);

  const [hexEditorFileDirectory, setHexEditorFileDirectory] = useStore((state) => [
    state.hexEditorFileDirectory,
    state.setHexEditorFileDirectory,
  ]);

  const fullConfig = useStore((state) => state.fullConfig);
  const switchIndexConfig = useStore((state) => state.switchIndexConfig);
  const reset = useStore((state) => state.reset);

  const configIndices = useMemo(() => {
    let indices: Record<string, string>[] = [];
    if (fullConfig && fullConfig["mappings"]) {
      indices = Object.keys(fullConfig["mappings"])
        .filter((index) => {
          if (useEsAPI && esAPI) {
            return fullConfig["mappings"][index]["esAPI"] === esAPI;
          } else if (!useEsAPI && elasticSearchURL) {
            return fullConfig["mappings"][index]["esURL"] === elasticSearchURL;
          } else {
            return false;
          }
        })
        .map((index) => ({ title: index, inputValue: index }));
    }
    return indices;
  }, [fullConfig, esAPI, elasticSearchURL, useEsAPI]);

  const [configEsAPIs, configEsURLs] = useMemo(() => {
    let configEsAPIs: Record<string, string>[] = [];
    let configEsURLs: Record<string, string>[] = [];

    if (fullConfig && fullConfig["mappings"]) {
      Object.entries(fullConfig["mappings"]).forEach(([index, indexConfig]: [string, any]) => {
        let esEndpoint = indexConfig["esAPI"];
        let esURL = indexConfig["esURL"];
        if (esEndpoint && !configEsAPIs.map((api) => api.inputValue).includes(esEndpoint)) {
          configEsAPIs.push({
            title: esEndpoint,
            inputValue: esEndpoint,
          });
        }
        if (esURL && !configEsURLs.map((url) => url.inputValue).includes(esURL)) {
          configEsURLs.push({
            title: esURL,
            inputValue: esURL,
          });
        }
      });
    }
    return [configEsAPIs, configEsURLs];
  }, [fullConfig]);

  const [columnOrder, setColumnOrder] = useStore((state) => [state.columnOrder, state.setColumnOrder]);

  const exportConfig = useStore((state) => state.exportConfig);
  const importConfig = useStore((state) => state.importConfig);
  const fetchIndexMapping = useStore((state) => state.fetchIndexMapping);
  const validIndex = useStore((state) => state.validIndex);
  const loadingIndex = useStore((state) => state.loadingIndex);
  const [exportSuccess, setExportSuccess] = useState(false);
  const loadingIndexMapping = useStore((state) => state.loadingIndexMapping);

  const [warningMessage, setWarningMessage] = useState<string>("");
  const [resetNotification, setResetNotification] = useState<boolean>(false);

  useEffect(() => {
    ipcRenderer.on("save-config-success", () => {
      setExportSuccess(true);
    });
    ipcRenderer.on("load-config-success", (evt: any, config: any) => {
      if (config.version !== null && config.version !== package_json.version) {
        let currentVersion = parseFloat(package_json.version);
        let configVersion = parseFloat(config.version);
        if (currentVersion < configVersion) {
          setWarningMessage(
            `This config file (v${config.version}) was generated with a newer version of the Safedocs Observatory (v${package_json.version}). Please Update.`
          );
        } else {
          setWarningMessage(
            `This config file (v${config.version}) was generated with an older version of the Safedocs Observatory (v${package_json.version}). Attempting to import...`
          );
        }
      }
      importConfig(config);
    });

    ipcRenderer.on("chosen-directory", (evt: any, info: any) => {
      if (info.trigger === "downloadPath") {
        setDownloadPath(info.path);
      } else if (info.trigger === "rawFileLocation") {
        setRawFileLocation(info.path);
      } else if (info.trigger === "hexEditorDir") {
        setHexEditorFileDirectory(info.path);
      }
    });
  }, [importConfig, setDownloadPath, setRawFileLocation, setHexEditorFileDirectory]);

  return (
    <div className="settings-container">
      <div className="titleCard">
        <h1>Settings</h1>
      </div>
      <Divider style={{ width: "100%" }} />

      <div className="configuration-container">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <Tooltip title="Export Config">
            <IconButton
              color="primary"
              aria-label="export config"
              component="span"
              className="config-btn"
              onClick={() => {
                let configExport = exportConfig();
                ipcRenderer.send("save-config", configExport);
              }}
            >
              <DownloadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import Config">
            <IconButton
              color="primary"
              aria-label="import config"
              component="span"
              className="config-btn"
              onClick={() => {
                ipcRenderer.send("load-config");
              }}
            >
              <FileUploadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
        <div>
          <h5 style={{ margin: 0, fontSize: "1.25em", color: "#525252" }}>ElasticSearch Settings</h5>
          <Divider style={{ width: "100%", marginBottom: "10px" }} />
          <FormGroup>
            <FormControlLabel
              labelPlacement="start"
              control={<Switch checked={useEsAPI} onClick={() => setUseEsAPI(!useEsAPI)} />}
              label="Use Passthrough API for ElasticSearch?"
              style={{ flexDirection: "row", paddingTop: "30px" }}
            />
          </FormGroup>
          {useEsAPI ? (
            <FormControl style={{ width: "100%", marginBottom: "5px" }}>
              <SearchSelect
                label="ElasticSearch API"
                itemName="endpoint"
                value={esAPI}
                options={configEsAPIs}
                onDeleteOption={(option) => {
                  let configCopy = { ...fullConfig };
                  for (let i = 0; i < Object.keys(configCopy["mappings"]).length; i++) {
                    let storedConfig = configCopy["mappings"][Object.keys(configCopy["mappings"])[i]];
                    if (storedConfig["esAPI"] === option) {
                      delete configCopy["mappings"][Object.keys(configCopy["mappings"])[i]];
                    }
                  }
                  importConfig(configCopy);
                }}
                onChange={(index) => {
                  setEsAPI(index);
                }}
              />
              <FormHelperText>Insert the ElasticSesarch index into the API with "{`{INDEX}`}".</FormHelperText>
            </FormControl>
          ) : (
            <SearchSelect
              className="setting-field"
              label="ElasticSearch URL"
              itemName="endpoint"
              value={elasticSearchURL}
              options={configEsURLs}
              onDeleteOption={(option) => {
                let configCopy = { ...fullConfig };
                for (let i = 0; i < Object.keys(configCopy["mappings"]).length; i++) {
                  let storedConfig = configCopy["mappings"][Object.keys(configCopy["mappings"])[i]];
                  if (storedConfig["esURL"] === option) {
                    delete configCopy["mappings"][Object.keys(configCopy["mappings"])[i]];
                  }
                }
                importConfig(configCopy);
              }}
              onChange={(index) => {
                setElasticSearchURL(index);
              }}
            />
          )}
          <span style={{ marginBottom: "30px", marginTop: "30px", display: "flex", alignItems: "center" }}>
            <Tooltip title="Validate Index">
              <IconButton
                color={validIndex ? "success" : "error"}
                aria-label="verify index"
                component="span"
                className="config-btn"
                onClick={() => {
                  setElasticSearchIndex(elasticSearchIndex);
                }}
              >
                {loadingIndex ? (
                  <CircularProgress disableShrink />
                ) : validIndex ? (
                  <CheckCircleIcon fontSize="large" />
                ) : (
                  <ErrorIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>
            <SearchSelect
              label="ElasticSearch Index"
              itemName="index"
              value={elasticSearchIndex}
              options={configIndices}
              onDeleteOption={(option) => {
                let configCopy = { ...fullConfig };
                delete configCopy["mappings"][option];
                importConfig(configCopy);
              }}
              onChange={(index) => {
                setElasticSearchIndex(index);
                switchIndexConfig(index);
              }}
            />
            <Tooltip title="Refresh Index Mapping">
              <IconButton
                color="primary"
                aria-label="refresh index"
                component="span"
                className="config-btn"
                onClick={() => {
                  fetchIndexMapping();
                }}
              >
                {loadingIndexMapping ? <CircularProgress disableShrink /> : <RefreshIcon fontSize="large" />}
              </IconButton>
            </Tooltip>
          </span>
          <TextField
            className="setting-field"
            label="Kibana URL"
            variant="outlined"
            value={kibanaURL}
            onChange={(evt) => {
              setKibanaURL(evt.target.value);
            }}
          />
        </div>
        <div>
          <h5 style={{ margin: 0, paddingTop: "4em", fontSize: "1.25em", color: "#525252" }}>Download Settings</h5>
          <Divider style={{ width: "100%", marginBottom: "30px" }} />
          <FormGroup>
            <FormControlLabel
              labelPlacement="start"
              control={
                <Switch checked={!useRawFileLocation} onClick={() => setUseRawFileLocation(!useRawFileLocation)} />
              }
              label="Use Download API?"
              style={{ flexDirection: "row", paddingBottom: "30px" }}
            />
          </FormGroup>
          {!useRawFileLocation ? (
            <FormControl style={{ width: "100%", marginBottom: "30px" }}>
              <TextField
                label="Download API"
                placeholder="https://api.safedocs.xyz/v1/files"
                variant="outlined"
                value={downloadAPI}
                onChange={(evt) => {
                  setDownloadAPI(evt.target.value);
                }}
              />
              <FormHelperText>
                Requested files will be appended to the API with "?paths=file1&amp;file2&amp;...".
              </FormHelperText>
            </FormControl>
          ) : (
            <FormControl style={{ display: "flex", flexDirection: "row", width: "100%", marginBottom: "30px" }}>
              <Button
                variant="contained"
                style={{ margin: "5px" }}
                onClick={() =>
                  ipcRenderer.send("choose-directory", { defaultPath: downloadPath, trigger: "rawFileLocation" })
                }
              >
                Choose Directory
              </Button>
              <TextField
                label="Raw File Location"
                style={{ flex: 1 }}
                variant="outlined"
                value={rawFileLocation}
                onChange={(evt) => {
                  setRawFileLocation(evt.target.value);
                }}
              />
            </FormControl>
          )}
          <Autocomplete
            value={allMappingFields.length ? downloadPathField : ""}
            options={allMappingFields}
            renderInput={(params: any) => <TextField {...params} variant="standard" label="Download Path Field" />}
            onChange={(_: any, newValue: any) => {
              setDownloadPathField(newValue);
            }}
            style={{ marginBottom: "30px" }}
          />
          {/* <Divider style={{ width: "100%", marginBottom: "30px" }} /> */}
        </div>

        <div>
          <h5 style={{ margin: 0, paddingTop: "4em", fontSize: "1.25em", color: "#525252" }}>Visualization Settings</h5>
          <Divider style={{ width: "100%", marginBottom: "30px" }} />

          <div style={{ display: "flex", width: "100%", marginBottom: "30px" }}>
            {[
              ["Significant Terms", sigTermsField, setSigTermsField],
              ["Suggestion Field", suggestionField, setSuggestionField],
              ["Completion Field", completionField, setCompletionField],
            ].map(([label, value, setValue]) => {
              const labelId = `${(label as string).replace(/ /g, "-")}-label`;
              const selectId = `${(label as string).replace(/ /g, "-")}-select`;

              return (
                <FormControl style={{ margin: "5px", flex: 1 }} key={selectId}>
                  <InputLabel id={labelId}>{label}</InputLabel>
                  <Select
                    labelId={labelId}
                    label={label}
                    id={selectId}
                    value={allMappingFields.length ? value : ""}
                    onChange={(evt) => {
                      (setValue as any)(evt.target.value);
                    }}
                  >
                    {allMappingFields.map((filter) => (
                      <MenuItem key={`settings-${selectId}-mapping-filter-${filter}`} value={filter}>
                        {filter}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            })}
          </div>
          <FormControl style={{ display: "flex", width: "100%", flexDirection: "row", marginBottom: "30px" }}>
            <Button
              variant="contained"
              style={{ margin: "5px" }}
              onClick={() =>
                ipcRenderer.send("choose-directory", { defaultPath: rawFileLocation, trigger: "hexEditorDir" })
              }
            >
              Choose Directory
            </Button>
            <TextField
              label="Hex Editor Output File Directory"
              style={{ flex: 1 }}
              variant="outlined"
              value={hexEditorFileDirectory}
              onChange={(evt) => {
                setHexEditorFileDirectory(evt.target.value);
              }}
            />
          </FormControl>

          <h5 style={{ margin: 0, paddingTop: "4em", fontSize: "1.25em" }}>Geospatial Settings</h5>
          <Divider style={{ width: "100%", marginBottom: "30px" }} />
          <FormControl style={{ minWidth: "200px" }}>
            <InputLabel id="geo-field-label-id">Geospatial Field</InputLabel>
            <Select
              id="geo-field-select"
              value={geoSpatialField && allMappingFields.includes(geoSpatialField) ? geoSpatialField : ""}
              label="Geospatial Field"
              labelId="geo-field-label-id"
              onChange={(evt) => {
                setGeoSpatialField(evt.target.value);
              }}
              style={{ margin: "5px" }}
            >
              {allMappingFields.map((field) => (
                <MenuItem key={`geo-field-${field}`} value={field}>
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div>
          <h5 style={{ margin: 0, marginTop: "30px", paddingTop: "4em", fontSize: "1.25em", color: "#525252" }}>
            Mapping Field Settings
          </h5>
          <Divider style={{ width: "100%", marginBottom: "30px" }} />
          <Autocomplete
            multiple
            disableCloseOnSelect
            value={allMappingFields.length ? nonVisibleFields : []}
            options={allMappingFields}
            renderInput={(params) => <TextField {...params} variant="standard" label="Hidden Table Columns" />}
            onChange={(_, newValue) => {
              setNonVisibleFields(newValue);
            }}
            style={{ marginBottom: "30px" }}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            limitTags={30}
            value={allMappingFields.length ? hiddenVizFields : []}
            options={allMappingFields}
            renderInput={(params) => <TextField {...params} variant="standard" label="Non-Visualizable Fields" />}
            onChange={(evt, newValue) => {
              setHiddenVizFields(newValue);
            }}
            style={{ marginBottom: "30px" }}
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            limitTags={30}
            value={allMappingFields.length ? nonFilterableFields : []}
            options={allMappingFields}
            renderInput={(params) => <TextField {...params} variant="standard" label="Non-Filterable Fields" />}
            onChange={(evt, newValue) => {
              setNonFilterableFields(newValue);
            }}
            style={{ marginBottom: "30px" }}
          />
          <div>
            <InputLabel id="column-order-label">Column Order</InputLabel>
            <Reorder
              className="column-order"
              reorderId="mappings"
              onReorder={(event: any, previousIndex: number, nextIndex: number, fromId: any, toId: any) => {
                let newColumnOrder = reorder(columnOrder, previousIndex, nextIndex);
                setColumnOrder(newColumnOrder);
              }}
              draggedClassName="dragged"
              placeholderClassName="mapping-placeholder"
            >
              {columnOrder.map((column, i) => (
                <Chip
                  disabled={nonVisibleFields.includes(column)}
                  key={column}
                  label={`${i}: ${column}`}
                  style={{ margin: "5px", cursor: "pointer" }}
                />
              ))}
            </Reorder>
          </div>
        </div>
        <div style={{ marginTop: "30px" }}>
          <Button
            variant="contained"
            color="error"
            style={{ margin: "5px" }}
            onClick={() => {
              setResetNotification(true);
              reset();
              ipcRenderer.send("sync-config", { trigger: "reset" });
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <Snackbar
        open={exportSuccess}
        autoHideDuration={3000}
        onClose={() => setExportSuccess(false)}
        message="Settings Configuration Exported"
      />
      <Snackbar open={warningMessage.length > 0} autoHideDuration={6000} onClose={() => setWarningMessage("")}>
        <Alert onClose={() => setWarningMessage("")} severity="warning" sx={{ width: "100%" }}>
          {warningMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={resetNotification} autoHideDuration={6000} onClose={() => setResetNotification(false)}>
        <Alert onClose={() => setResetNotification(false)} severity="success" sx={{ width: "100%" }}>
          Settings Reset
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SettingsView;
