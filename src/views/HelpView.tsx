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
