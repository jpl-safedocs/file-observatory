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

import { FC, useMemo, useState, useEffect } from "react";

import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { IconButton, TextField, Tooltip } from "@mui/material";

import { FixedSizeList } from "react-window";

import { useDebounce } from "usehooks-ts";

import useStore, { Filter } from "../utils/store";

import "../scss/FilterSelection.scss";

interface FilterCategoryItemProps {
  label: string;
  itemName: string;
  categoryFilters: any[];
  activeFilters: Filter[];
  setActiveFilters: (activeFilters: Filter[]) => void;
  style?: any;
}

const FilterCategoryItem: FC<FilterCategoryItemProps> = ({
  label,
  itemName,
  categoryFilters,
  activeFilters,
  setActiveFilters,
  style
}) => {
  return (
    <ListItem style={style}>
      <ListItemButton
        key={`${label}-${itemName}`}
        sx={{ pl: 4 }}
        onClick={() => {
          if (categoryFilters.includes(itemName)) {
            setActiveFilters(
              activeFilters.filter((activeFilter) => activeFilter.name !== label || activeFilter.value !== itemName)
            );
          } else {
            setActiveFilters([...activeFilters, { name: label, value: itemName }]);
          }
        }}
      >
        <ListItemIcon>
          <Checkbox edge="start" checked={categoryFilters.includes(itemName)} tabIndex={-1} disableRipple />
        </ListItemIcon>
        <Tooltip title={itemName}>
          <ListItemText primary={itemName} />
        </Tooltip>
      </ListItemButton>
    </ListItem>
  );
};

interface FilterCategoryProps {
  label: string;
  data: any[];
  style?: any;
}

const FilterCategory: FC<FilterCategoryProps> = ({ label, data, style }) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const activeFilters = useStore((state) => state.activeFilters);
  const setActiveFilters = useStore((state) => state.setActiveFilters);

  const [unsavedActiveFilters, setUnsavedActiveFilters] = useState<Filter[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    setUnsavedActiveFilters(activeFilters);
    setUnsavedChanges(false);
  }, [activeFilters]);

  const fetchSingleFilterAggregation = useStore((state) => state.fetchSingleFilterAggregation);

  const [filteredAggregationData, setFilteredAggregationData] = useState<string[]>([]);

  const categoryFilters = useMemo(() => {
    return unsavedActiveFilters.filter((activeFilter) => activeFilter.name === label).map((activeFilter) => activeFilter.value);
  }, [unsavedActiveFilters, label]);

  const debouncedSearchText = useDebounce(searchText, 500);

  const filteredData = useMemo(() => {
    if (!debouncedSearchText || debouncedSearchText.length === 0) {
      return data;
    }
    return filteredAggregationData.length > 0
      ? filteredAggregationData
      : data.filter((itemName: string) => {
        return itemName.toLowerCase().includes(debouncedSearchText.toLowerCase());
      });
  }, [debouncedSearchText, data, filteredAggregationData]);

  useEffect(() => {
    if (data.length >= 1000 && debouncedSearchText && debouncedSearchText.length > 0) {
      fetchSingleFilterAggregation(label, debouncedSearchText).then((filterList) => {
        setFilteredAggregationData(filterList);
      });
    }
  }, [data, debouncedSearchText, label, fetchSingleFilterAggregation]);

  let countText = useMemo(() => {
    if (filteredAggregationData.length > 0) {
      return `${filteredAggregationData.length}`;
    }
    else {
      return data.length === 1000 ? `${data.length}+` : `${data.length}`;
    }
  }, [data, filteredAggregationData]);

  return (
    <>
      <ListItemButton onClick={() => {
        if (open && unsavedChanges) {
          setActiveFilters(unsavedActiveFilters);
        }

        setOpen(!open);
      }}>
        <ListItemText
          style={{ color: data.length === 0 ? "#737373" : "black" }}
          primary={`${label} (${countText})`}
        />
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <div style={{ display: "flex" }}>
          <TextField
            style={{ width: "calc(100% - 50px)" }}
            label={`Search ${label}`}
            variant="outlined"
            onChange={(evt) => {
              setSearchText(evt.target.value);
            }}
          />
          <div style={{ width: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tooltip title={unsavedChanges ? "Apply Filter" : categoryFilters.length > 0 ? "Clear Filter" : "Add items to filter"}>
              <IconButton onClick={() => {
                if (unsavedChanges) {
                  setActiveFilters(unsavedActiveFilters);
                } else if (categoryFilters.length > 0) {
                  // Clear all filters for this category
                  setActiveFilters(activeFilters.filter((activeFilter) => activeFilter.name !== label));
                }
              }}>
                {unsavedChanges ? <FilterAltIcon /> : categoryFilters.length > 0 ? <FilterAltOffIcon /> : <FilterAltOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <FixedSizeList height={400} width={"22vw"} itemSize={46} itemCount={filteredData.length} overscanCount={5}>
          {({ index, style }) => (
            <FilterCategoryItem
              label={label}
              itemName={filteredData[index]}
              categoryFilters={categoryFilters}
              style={style}
              activeFilters={unsavedActiveFilters}
              setActiveFilters={(filters) => {
                setUnsavedActiveFilters(filters);
                setUnsavedChanges(true);
              }}
            />
          )}
        </FixedSizeList>
      </Collapse>
    </>
  );
};

const FilterSelection: FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const setActiveFilters = useStore((state) => state.setActiveFilters);
  const activeFilters = useStore((state) => state.activeFilters);
  const aggregations = useStore((state) => state.aggregations);
  const nonFilterableFields = useStore((state) => state.nonFilterableFields);
  const advancedSearchOpen = useStore((state) => state.advancedSearchOpen);

  return (
    <>
      <div className={`filter-area ${filtersOpen ? "expanded" : "collapsed"}`}>
        <Chip
          className="filters"
          variant={filtersOpen ? "filled" : "outlined"}
          style={{
            color: "black",
            width: filtersOpen ? "100%" : "250px",
            justifyContent: "flex-start",
            padding: "5px",
          }}
          onClick={() => setFiltersOpen(!filtersOpen)}
          onDelete={() => setFiltersOpen(!filtersOpen)}
          deleteIcon={filtersOpen ? <RemoveCircleOutlineIcon /> : <AddCircleIcon />}
          disabled={advancedSearchOpen}
          label="Filters"
        />
        <List
          sx={{
            width: "100%",
            padding: 0,
            height: filtersOpen ? "calc(100vh - 82px - 15px)" : 0,
            overflow: "hidden",
            transition: "all 0.25s ease",
            color: "black",
          }}
          component="nav"
          className="filters-list"
        >
          {Object.entries(aggregations)
            .filter(([filterName, aggregations]: [string, any]) => aggregations.buckets.length > 0)
            .sort((a, b) => (a[0] > b[0] ? 1 : -1))
            .filter(([filterName, _]) => !nonFilterableFields.includes(filterName))
            .map(([filterName, aggregations]: [string, any]) => {
              return (
                <FilterCategory
                  key={`filter-category-${filterName}`}
                  label={filterName}
                  data={aggregations.buckets.map((bucket: any) => bucket.key).sort()}
                />
              );
            })}
          {Object.entries(aggregations)
            .filter(([filterName, aggregations]: [string, any]) => aggregations.buckets.length === 0)
            .sort((a, b) => (a[0] > b[0] ? 1 : -1))
            .filter(([filterName, _]) => !nonFilterableFields.includes(filterName))
            .map(([filterName, aggregations]: [string, any]) => {
              return (
                <FilterCategory
                  key={`filter-category-${filterName}`}
                  label={filterName}
                  data={aggregations.buckets.map((bucket: any) => bucket.key).sort()}
                />
              );
            })}
        </List>
      </div>
      {advancedSearchOpen ? (
        <div className="filter-tags"></div>
      ) : (
        <div className="filter-tags">
          {activeFilters.map((activeFilter) => {
            return (
              <Chip
                key={`${activeFilter.name}-${activeFilter.value}`}
                label={
                  <Tooltip title={activeFilter.value} placement="bottom-start">
                    <span className="filter-chip">
                      <b>{activeFilter.name}:</b> <span>{activeFilter.value}</span>
                    </span>
                  </Tooltip>
                }
                variant="outlined"
                style={{ margin: "2px" }}
                onDelete={() => {
                  setActiveFilters(
                    activeFilters.filter(
                      (filter) => filter.name !== activeFilter.name || filter.value !== activeFilter.value
                    )
                  );
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

export default FilterSelection;
