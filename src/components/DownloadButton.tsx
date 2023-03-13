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

interface Props {}

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
  const useRawFileLocation = useStore((state) => state.useRawFileLocation);

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
              console.log("DOWNLOADING", selectedDocuments, urls);
              ipcRenderer.send("download", {
                useRawFileLocation: useRawFileLocation,
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
                    console.log("DOWNLOAD RANDOM", count, urls);
                    ipcRenderer.send("download", {
                      useRawFileLocation: useRawFileLocation,
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
