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

import { FC, useState, useMemo, useEffect } from "react";

import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import HelpIcon from "@mui/icons-material/Help";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import RefreshIcon from "@mui/icons-material/Refresh";

import useStore from "../utils/store";
import { getSearchQuery, getGroupedFilters } from "../utils/modifiers";

import "../scss/Header.scss";

// @ts-ignore
const { ipcRenderer } = window.require("electron");

interface TabLabelProps {
  label: string;
  icon: JSX.Element;
}
const TabLabel: FC<TabLabelProps> = ({ label, icon }) => (
  <span style={{ display: "flex", alignItems: "center" }}>
    {icon}
    {label}
  </span>
);

const Header: FC = () => {
  const activePage = useStore((state) => state.activePage);
  const setActivePage = useStore((state) => state.setActivePage);
  const [query, setQuery] = useStore((state) => [state.query, state.setQuery]);
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const activeFilters = useStore((state) => state.activeFilters);
  const suggestionField = useStore((state) => state.suggestionField);
  const completionField = useStore((state) => state.completionField);
  const filterList = useStore((state) => state.filterList);
  const fetchFilterAggregations = useStore((state) => state.fetchFilterAggregations);
  const activeViz = useStore((state) => state.activeViz);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useStore((state) => [
    state.advancedSearchOpen,
    state.setAdvancedSearchOpen,
  ]);
  const [advancedSearchExpanded, setAdvancedSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [windowMaximized, setWindowMaximized] = useState(false);

  const groupedFilters = useMemo(() => {
    return getGroupedFilters(activeFilters);
  }, [activeFilters]);

  const submitSearch = () => {
    // call submitSearch on refresh button click
    let queryDump = getSearchQuery(
      searchValue,
      suggestionField,
      completionField,
      groupedFilters,
      filterList,
      activeViz === "Data Viz"
    );
    setQuery(queryDump);
    setSearchTerm(searchValue);
    fetchFilterAggregations(filterList);
  };

  useEffect(() => {
    if (!advancedSearchOpen) {
      let queryDump = getSearchQuery(
        searchValue,
        suggestionField,
        completionField,
        groupedFilters,
        filterList,
        activeViz === "Data Viz"
      );
      setQuery(queryDump);
      fetchFilterAggregations(filterList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedSearchOpen, groupedFilters]);

  const validJSON = useMemo(() => {
    if (!advancedSearchOpen) {
      return true;
    }
    try {
      let searchQuery = JSON.parse(searchValue);
      if (
        Object.keys(searchQuery).length === 0 ||
        !searchQuery["query"] ||
        Object.keys(searchQuery["query"]).length === 0
      ) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [searchValue, advancedSearchOpen]);

  return (
    <header>
      <h1
        onDoubleClick={() => {
          if (windowMaximized) {
            ipcRenderer.send("unmaximize-app-window");
            setWindowMaximized(false);
          } else {
            ipcRenderer.send("maximize-app-window");
            setWindowMaximized(true);
          }
        }}
      >
        <img src="header.svg" alt="DARPA Safedocs Observatory Header" />
      </h1>
      <FormControl
        sx={{
          m: 1,
          marginLeft: "100px",
          cursor: "text",
          display: "flex",
          flexDirection: "row",
          position: advancedSearchOpen ? "absolute" : "relative",
          top: advancedSearchOpen ? 0 : "inherit",
          zIndex: advancedSearchOpen ? 9999 : 10,
        }}
        variant="outlined"
        className={advancedSearchOpen ? "Mui-focused" : ""}
        onChange={(evt) => {
          setSearchValue((evt.target as any).value);
        }}
      >
        {advancedSearchOpen ? (
          <TextField
            multiline={advancedSearchExpanded}
            error={!validJSON}
            value={searchValue}
            className={advancedSearchExpanded ? "advanced-search-max" : "advanced-search-min"}
          />
        ) : (
          <OutlinedInput
            value={searchValue}
            onKeyDown={(evt) => {
              if (evt.key === "Enter") {
                submitSearch();
                evt.preventDefault();
              }
            }}
            endAdornment={
              <InputAdornment
                position="end"
                style={{ cursor: "pointer" }}
                onClick={(evt) => {
                  submitSearch();
                }}
              >
                <SearchIcon />
              </InputAdornment>
            }
            aria-describedby="query-search"
            inputProps={{
              "aria-label": "search",
              style: { padding: "5px" },
            }}
          />
        )}
        {advancedSearchOpen && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "5px" }}>
            <IconButton
              style={{ background: "white" }}
              disabled={!validJSON}
              onClick={() => {
                if (validJSON) {
                  let directQuery = JSON.parse(searchValue);
                  setQuery(directQuery);
                  fetchFilterAggregations(filterList, directQuery["query"]);
                }
              }}
            >
              <SearchIcon htmlColor={validJSON ? "black" : "red"} />
            </IconButton>

            {advancedSearchExpanded && (
              <IconButton
                style={{ cursor: "pointer", background: "white", marginTop: "5px" }}
                onClick={() => {
                  setAdvancedSearchExpanded(!advancedSearchExpanded);
                }}
              >
                <ArrowDropUpIcon htmlColor="black" />
              </IconButton>
            )}
          </div>
        )}

        <IconButton
          style={{
            cursor: "pointer",
            background: advancedSearchOpen ? "#4682c8" : "white",
            transition: "all 0.5s ease",
            alignSelf: "flex-start",
            marginLeft: "5px",
          }}
          onClick={() => {
            if (!advancedSearchOpen) {
              setSearchValue(JSON.stringify(query, null, 2));
              setAdvancedSearchExpanded(true);
            } else {
              setSearchValue("");
              setSearchTerm("");
            }
            setAdvancedSearchOpen(!advancedSearchOpen);
          }}
        >
          <SettingsEthernetIcon
            style={{ transition: "all 0.5s ease", color: advancedSearchOpen ? "white" : "black" }}
          />
        </IconButton>
        {advancedSearchOpen && !advancedSearchExpanded && (
          <IconButton
            style={{ cursor: "pointer", background: "white", alignSelf: "flex-start", marginLeft: "5px" }}
            onClick={() => {
              setAdvancedSearchExpanded(!advancedSearchExpanded);
            }}
          >
            <ArrowDropDownIcon htmlColor="black" />
          </IconButton>
        )}
        <IconButton
          style={{ cursor: "pointer", background: "white", alignSelf: "flex-start", marginLeft: "5px" }}
          onClick={() => {
            submitSearch();
          }}
        >
          <RefreshIcon htmlColor="black" />
        </IconButton>
      </FormControl>
      <nav style={{ marginLeft: "auto" }}>
        <Tabs
          value={activePage}
          onChange={(_, value) => setActivePage(value)}
          style={{ color: "white" }}
          textColor="inherit"
          indicatorColor="secondary"
          aria-label="Nav Tabs"
        >
          <Tab
            label={<TabLabel label="Search" icon={<ManageSearchIcon />} />}
            id={`page-${activePage}`}
            aria-controls={`page-${activePage}`}
          />
          <Tab
            label={<TabLabel label="Help" icon={<HelpIcon />} />}
            id={`page-${activePage}`}
            aria-controls={`page-${activePage}`}
          />
          <Tab
            label={<TabLabel label="Mapping" icon={<StorageIcon />} />}
            id={`page-${activePage}`}
            aria-controls={`page-${activePage}`}
          />
          <Tab
            label={<TabLabel label="Settings" icon={<SettingsIcon />} />}
            id={`page-${activePage}`}
            aria-controls={`page-${activePage}`}
          />
        </Tabs>
      </nav>
    </header>
  );
};

export default Header;
