import { FC } from "react";
import Divider from "@mui/material/Divider";

import useStore from "../utils/store";

import "../scss/HelpView.scss";

const package_json = require("../../package.json");

const HelpView: FC = () => {
  const setActivePage = useStore((state) => state.setActivePage);

  return (
    <div className="help-container">
      <div className="help-title-container">
        <h1>Help</h1>
      </div>
      <Divider style={{ width: "100%" }} />
      <div className="help-body-container" style={{ height: "calc(100vh - 260px)" }}>
        <div className="main-body-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <h1>About the Observatory</h1>
          <div className="help-about">
            The Safedocs File Observatory is an interactive tool for searching, aggregating, and visualizing large
            ElasticSearch parser metadata document sets. The tool is designed to be used either with a remote data
            store, or configured to use a local one. Configuration information can be found on the{" "}
            <span
              className="link"
              onClick={() => {
                setActivePage(3);
              }}
            >
              Settings
            </span>{" "}
            tab.
          </div>
          <h1>Configuration</h1>
          <div className="help-about">
            In order to use this tool, an ElasticSearch URI and index must first be configured. This can be done by
            either using a passthrough API, like is found at{" "}
            <i>{"https://api.safedocs.xyz/v1/elasticsearch/{INDEX}"}</i> ({"{INDEX}"} will be automatically replaced by
            the designated index), or by directly connecting to a local or public ElasticSearch instance. Once this is
            configured, you can then specify an API to use for downloading files, or point the tool to a local/mounted
            directory. If an API is specified, file paths will be passed to it as query strings (e.g.
            ?paths=/path/to/file1&amp;/path/to/file2).
            <br />
            <br /> The next set of configuration setting pertains to the Visualization section on the Search tab. These
            settings are used to determine which fields should be used for specific visualization-based queries that are
            made on top the generic search query. If no fields are specified or the specified fields don't work for the
            visualization type, no data will show for the respective visualizations.
            <br />
            <br />
            The last group of settings are to configure the table view, filter list, and specify which fields should
            show up as visualizable. These settings can also be modified from the Mappings tab, which additionally
            allows you to see the respective properties of each field in Elasticsearch.
          </div>
          <h1>Credits</h1>
          <div className="help-about">
            This tool was developed by the{" "}
            <a href="https://www.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer">
              NASA Jet Propulsion Laboratory
            </a>{" "}
            as part of the ongoing work for the{" "}
            <a href="https://www.darpa.mil/program/safe-documents" target="_blank" rel="noopener noreferrer">
              {" "}
              DARPA Safedocs Program
            </a>
            .
          </div>
          <div className="version-info" style={{ marginTop: "auto", display: "flex", alignItems: "center" }}>
            <div>Safedocs File Observatory Version:</div>{" "}
            <div className="version-number-text">{package_json.version}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
