import { FC, useMemo, useState, useEffect } from "react";

import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { TextField, Tooltip } from "@mui/material";

import { FixedSizeList } from "react-window";

import { useDebounce } from "usehooks-ts";

import useStore from "../utils/store";

import "../scss/FilterSelection.scss";

interface FilterCategoryItemProps {
  label: string;
  itemName: string;
  categoryFilters: any[];
  style?: any;
}

const FilterCategoryItem: FC<FilterCategoryItemProps> = ({ label, itemName, categoryFilters, style }) => {
  const activeFilters = useStore((state) => state.activeFilters);
  const setActiveFilters = useStore((state) => state.setActiveFilters);

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
  const fetchSingleFilterAggregation = useStore((state) => state.fetchSingleFilterAggregation);

  const [filteredAggregationData, setFilteredAggregationData] = useState<string[]>([]);

  const categoryFilters = activeFilters
    .filter((activeFilter) => activeFilter.name === label)
    .map((activeFilter) => activeFilter.value);

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
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemText
          style={{ color: data.length === 0 ? "#737373" : "black" }}
          primary={`${label} (${countText})`}
        />
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <TextField
          label={`Search ${label}`}
          variant="outlined"
          onChange={(evt) => {
            setSearchText(evt.target.value);
          }}
        />
        <FixedSizeList height={400} width={"22vw"} itemSize={46} itemCount={filteredData.length} overscanCount={5}>
          {({ index, style }) => (
            <FilterCategoryItem
              label={label}
              itemName={filteredData[index]}
              categoryFilters={categoryFilters}
              style={style}
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
