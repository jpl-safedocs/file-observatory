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

import { FC, useState } from "react";

import FilterSelection from "../components/FilterSelection";

import "../scss/SearchView.scss";
import SearchTable from "../components/SearchTable";
import Visualizations from "../components/Visualizations";

const SearchView: FC = () => {
  const [expandTableView, setExpandTableView] = useState(false);

  return (
    <div className="search-area">
      <FilterSelection />
      <div style={{ display: "flex", marginTop: "6px" }}>
        <div
          style={{
            flex: 1,
            maxWidth: expandTableView ? "calc(100% - 20px)" : "50%",
            margin: "0 10px",
          }}
          data-testid="search-table-container"
        >
          <SearchTable expandTableView={expandTableView} setExpandTableView={setExpandTableView} />
        </div>
        <div
          style={{
            flex: expandTableView ? 0 : 1,
            marginRight: "10px",
            display: expandTableView ? "none" : "block",
            width: "100%",
            maxWidth: "calc(100% - 30px)",
          }}
        >
          <Visualizations />
        </div>
      </div>
    </div>
  );
};

export default SearchView;
