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
