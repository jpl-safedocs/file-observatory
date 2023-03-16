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

import { FC, useMemo, useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import useStore from "../../utils/store";

// @ts-ignore
const { ipcRenderer } = window.require("electron");
// @ts-ignore
const path = window.require("path");

const HexEditor: FC = () => {
  const rawFileLocation = useStore((state) => state.rawFileLocation);
  const useRawFileLocation = useStore((state) => state.useRawFileLocation);
  const selectedIndices = useStore((state) => state.selectedDocuments);
  const getDocumentsDownloadPaths = useStore((state) => state.getDocumentsDownloadPaths);

  const [hexEditorFile, setHexEditorFile] = useState<string>("");
  const [hexEditorFileError, setHexEditorFileError] = useState<boolean>(false);
  const [hexEditorFileErrorMessage, setHexEditorFileErrorMessage] = useState<string>("");
  const [hexEditorLoading, setHexEditorLoading] = useState(false);
  const [recentHexEditorFiles, setRecentHexEditorFiles] = useStore((state) => [
    state.recentHexEditorFiles,
    state.setRecentHexEditorFiles,
  ]);

  const [hexEditorFileDirectory, setHexEditorFileDirectory] = useStore((state) => [
    state.hexEditorFileDirectory,
    state.setHexEditorFileDirectory,
  ]);

  const [existingHexEditorFiles, setExistingHexEditorFiles] = useState<string[]>([]);

  const checkedDocuments = useMemo(() => {
    return selectedIndices.map((index) => {
      let paths = getDocumentsDownloadPaths([index]);
      if (paths.length > 0) {
        return paths[0];
      } else {
        return "";
      }
    });
  }, [selectedIndices, getDocumentsDownloadPaths]);

  useEffect(() => {
    ipcRenderer.on("chosen-file", (evt: any, info: any) => {
      if (info.trigger === "hex-editor-select") {
        setHexEditorFile(info.path);
      }
    });

    ipcRenderer.on("generated-hex-file", (evt: any, info: any) => {
      setHexEditorLoading(false);
      if (!info.error) setHexEditorFile(info.path);
      setHexEditorFileError(info.error);
      setHexEditorFileErrorMessage(info.message);
    });

    ipcRenderer.on("chosen-directory", (evt: any, info: any) => {
      if (info.trigger === "hex-editor-select") {
        setHexEditorFileDirectory(info.path);
      }
    });

    ipcRenderer.on("listed-dir", (evt: any, info: any) => {
      if (info.trigger === "hex-editor-select") {
        setExistingHexEditorFiles(info.files);
      }
    });
  }, [setHexEditorFile, setExistingHexEditorFiles, setHexEditorFileDirectory, setHexEditorLoading]);

  useEffect(() => {
    if (hexEditorFileDirectory && hexEditorFileDirectory.length > 0) {
      ipcRenderer.send("list-dir", { path: hexEditorFileDirectory, trigger: "hex-editor-select", extension: ".html" });
    }
  }, [hexEditorFileDirectory, hexEditorFile, hexEditorLoading]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h4 style={{ marginBottom: 0 }}><i>Trail of Bits Polyfile</i> Hex Editor</h4>
      <h5 style={{ marginBottom: 0 }}>Select a document from the table to generate and view</h5>
      <span style={{ fontSize: "12px", marginBottom: "15px" }}>
        This may take a couple minutes depending on the size of the document.
      </span>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Tooltip
          title={
            !hexEditorLoading && hexEditorFile && hexEditorFile.endsWith(".html")
              ? hexEditorFile
              : hexEditorFileErrorMessage
          }
        >
          <Button
            disabled={!hexEditorFile || !hexEditorFile.length}
            color={hexEditorFileError ? "error" : "primary"}
            style={{
              margin: "5px",
              padding: !hexEditorLoading && hexEditorFile.endsWith(".html") ? "10px 33px" : "10px 15px",
            }}
            variant="contained"
            onClick={() => {
              setHexEditorFileErrorMessage("");
              setRecentHexEditorFiles(Array.from(new Set([hexEditorFile, ...recentHexEditorFiles])).slice(0, 5));
              if (hexEditorFile && hexEditorFile.endsWith(".html")) {
                window.open(
                  `file://${path.posix.normalize(hexEditorFile)}`,
                  "_blank",
                  "width=1500,height=800,frame=true,nodeIntegration=no"
                );
              } else {
                ipcRenderer.send("generate-hex-editor-file", {
                  url: hexEditorFile,
                  path: hexEditorFile,
                  outputFile: path.join(hexEditorFileDirectory, `${hexEditorFile.split("/").pop()}.html`),
                  useRawFileLocation: useRawFileLocation || !hexEditorFile.startsWith("http"),
                });
                setHexEditorLoading(true);
              }
            }}
          >
            {hexEditorLoading ? (
              <CircularProgress style={{ color: "white", padding: "0 25px" }} size="25px" disableShrink />
            ) : hexEditorFile && hexEditorFile.endsWith(".html") ? (
              "Open"
            ) : (
              "Generate"
            )}
          </Button>
        </Tooltip>
        <FormControl style={{ width: "375px" }}>
          <InputLabel id="file-select-label">Select Document</InputLabel>
          <Select
            id="file-select"
            value={
              hexEditorFile && [...recentHexEditorFiles, ...checkedDocuments].includes(hexEditorFile)
                ? hexEditorFile
                : ""
            }
            placeholder="Select Document"
            label="Select Document"
            labelId="file-select-label"
            onChange={(evt) => {
              if (evt.target.value === "local") {
                ipcRenderer.send("choose-file", {
                  defaultPath: rawFileLocation,
                  trigger: "hex-editor-select",
                });
              } else {
                setHexEditorFile(evt.target.value);
              }
            }}
          >
            <ListSubheader>Selected Documents</ListSubheader>
            {checkedDocuments.map((path) => (
              <MenuItem key={`checked-${path}`} value={path}>
                {path}
              </MenuItem>
            ))}
            <ListSubheader>
              Recent
              <Button disabled={recentHexEditorFiles.length === 0} onClick={() => setRecentHexEditorFiles([])}>
                Clear
              </Button>
            </ListSubheader>
            {hexEditorFile &&
              hexEditorFile.length > 0 &&
              !recentHexEditorFiles.includes(hexEditorFile) &&
              !checkedDocuments.includes(hexEditorFile) && <MenuItem value={hexEditorFile}>{hexEditorFile}</MenuItem>}
            {recentHexEditorFiles.map((fileName) => (
              <MenuItem key={`recent-${fileName}`} value={fileName}>
                {fileName}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem value="local">Choose Document from Computer</MenuItem>
          </Select>
        </FormControl>
      </div>
      <FormControl style={{ display: "flex", width: "488px", flexDirection: "row", marginTop: "15px" }}>
        <Button
          variant="contained"
          style={{ margin: "5px" }}
          onClick={() =>
            ipcRenderer.send("choose-directory", { defaultPath: rawFileLocation, trigger: "hex-editor-select" })
          }
        >
          Choose Directory
        </Button>
        <TextField
          label="Output File Directory"
          style={{ flex: 1 }}
          variant="outlined"
          value={hexEditorFileDirectory}
          onChange={(evt) => {
            setHexEditorFileDirectory(evt.target.value);
          }}
        />
      </FormControl>
      <FormControl style={{ width: "488px", marginTop: "15px" }}>
        <InputLabel id="existing-file-select-label">Open Polyfile Generated Hex Editor File</InputLabel>
        <Select
          value=""
          id="existing-file-select"
          placeholder="Open Generated Hex Editor File"
          label="Open Generated Hex Editor File"
          labelId="existing-file-select-label"
        >
          {existingHexEditorFiles.map((fileName) => (
            <MenuItem
              key={`existing-${fileName}`}
              value={fileName}
              onClick={() => {
                window.open(
                  `file://${path.posix.normalize(hexEditorFileDirectory)}/${fileName}`,
                  "_blank",
                  "width=1500,height=800,frame=true,nodeIntegration=no"
                );
              }}
            >
              {fileName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default HexEditor;
