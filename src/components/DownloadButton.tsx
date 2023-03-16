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

import { useState, useEffect, FC } from "react";
import { Template, TemplatePlaceholder, Plugin } from "@devexpress/dx-react-core";
import DownloadIcon from "@mui/icons-material/Download";
import { Divider } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";

import useStore from "../utils/store";

// @ts-ignore
const { ipcRenderer } = window.require("electron");

interface Props { }

const DownloadButton: FC<Props> = () => {
  const [openOptions, setOpenOptions] = useState(false);
  const [optionsAnchorElement, setOptionsAnchorElement] = useState<null | HTMLElement>(null);
  const [selectedDocuments, setSelectedDocuments] = useStore((state) => [
    state.selectedDocuments,
    state.setSelectedDocuments,
  ]);
  const totalDocumentCount = useStore((state) => state.totalDocumentCount);
  const getRandomDocumentsDownloadPaths = useStore((state) => state.getRandomDocumentsDownloadPaths);
  const getDocumentsDownloadPaths = useStore((state) => state.getDocumentsDownloadPaths);
  const downloadMode = useStore((state) => state.downloadMode);

  const s3BucketName = useStore((state) => state.s3BucketName);
  const s3AccessKeyID = useStore((state) => state.s3AccessKeyID);
  const s3SecretAccessKey = useStore((state) => state.s3SecretAccessKey);

  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    ipcRenderer.on("download complete", (event: any, file: any) => {
      setDownloadMessage(`Download Complete ${file}`);
      console.log("Downloaded", file);
    });
  }, [setDownloadMessage]);

  return (
    <Plugin name="UploadButton" dependencies={[{ name: "Toolbar" }]}>
      <Template name="toolbarContent">
        <TemplatePlaceholder />
        <div
          id="download-button"
          aria-controls={openOptions ? "download-options-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openOptions ? "true" : undefined}
          style={{ display: "flex", alignItems: "center", margin: "0 30px", marginLeft: "25px", cursor: "pointer" }}
          onClick={(evt) => {
            setOpenOptions(!openOptions);
            setOptionsAnchorElement(evt.currentTarget);
          }}
        >
          <DownloadIcon
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#4682C8",
              margin: "5px",
              padding: "5px",
              color: "white",
              borderRadius: "5px",
            }}
          />
          Download
        </div>
        <Menu
          id="download-options-menu"
          anchorEl={optionsAnchorElement}
          open={openOptions}
          onClose={() => setOpenOptions(false)}
          MenuListProps={{
            "aria-labelledby": "download-button",
          }}
        >
          <MenuItem
            onClick={() => {
              const urls = getDocumentsDownloadPaths(selectedDocuments);
              ipcRenderer.send("download", {
                useRawFileLocation: downloadMode === "local",
                useS3: downloadMode === "s3",
                s3BucketName,
                s3AccessKeyID,
                s3SecretAccessKey,
                urls,
              });
              setSelectedDocuments([]);
              setOpenOptions(false);
            }}
            disabled={selectedDocuments.length === 0}
          >
            Download Selected ({selectedDocuments.length})
          </MenuItem>
          <Divider />
          {[5, 10, 25].map((count) => {
            return (
              <MenuItem
                key={`count-${count}`}
                onClick={() => {
                  getRandomDocumentsDownloadPaths(count).then((urls: string[]) => {
                    ipcRenderer.send("download", {
                      useRawFileLocation: downloadMode === "local",
                      useS3: downloadMode === "s3",
                      s3BucketName,
                      s3AccessKeyID,
                      s3SecretAccessKey,
                      urls,
                    });
                  });
                  setOpenOptions(false);
                }}
                disabled={totalDocumentCount < count}
              >
                Download Random ({count})
              </MenuItem>
            );
          })}
        </Menu>
        <Snackbar
          open={downloadMessage.length > 0}
          autoHideDuration={3000}
          onClose={() => setDownloadMessage("")}
          message={downloadMessage}
        />
      </Template>
    </Plugin>
  );
};

export default DownloadButton;
