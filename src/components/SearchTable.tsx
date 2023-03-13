import { FC, useEffect, useMemo, useState } from "react";

import { useDebounce } from "usehooks-ts";

import {
  SelectionState,
  SearchState,
  IntegratedFiltering,
  SortingState,
  IntegratedSelection,
  RowDetailState,
  VirtualTableState,
  DataTypeProvider,
} from "@devexpress/dx-react-grid";

import {
  Grid,
  VirtualTable,
  Table,
  TableHeaderRow,
  TableSelection,
  TableFixedColumns,
  ColumnChooser,
  TableColumnVisibility,
  Toolbar,
  DragDropProvider,
  TableColumnReordering,
  TableColumnResizing,
  TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";

import { withStyles } from "@mui/styles";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/Error";

import Tooltip from "@mui/material/Tooltip";

import { CopyToClipboard } from "react-copy-to-clipboard";

import ExpandToggle from "./ExpandToggle";
import DownloadButton from "./DownloadButton";

import useStore from "../utils/store";

import "../scss/SearchTable.scss";

const styles = (theme: any) => ({
  tableStriped: {
    backgroundColor: "white",
    "& tbody tr:nth-of-type(odd)": {
      backgroundColor: "#ececec",
    },
  },
  toolbar: {
    backgroundColor: "#A6B8DC",
  },
});

const TableComponentBase = ({ classes, ...restProps }: any) => (
  <Table.Table {...restProps} className={classes.tableStriped} />
);

const ToolbarComponentBase = ({ classes, ...restProps }: any) => {
  const totalDocumentCount = useStore((state) => state.totalDocumentCount);
  const loadingDocuments = useStore((state) => state.loadingDocuments);
  const loadingIndex = useStore((state) => state.loadingIndex);
  const loadingIndexMapping = useStore((state) => state.loadingIndexMapping);
  const documentError = useStore((state) => state.documentError);
  const findTerm = useStore((state) => state.findTerm);
  const setFindTerm = useStore((state) => state.setFindTerm);

  return (
    <Toolbar.Root {...restProps} className={classes.toolbar}>
      {loadingIndexMapping || loadingIndex || loadingDocuments ? (
        <CircularProgress disableShrink />
      ) : documentError ? (
        <Tooltip title="Error fetching documents with the given query. There might be a network connectivity issue or a problem with the given API.">
          <ErrorIcon fontSize="large" color="error" />
        </Tooltip>
      ) : (
        <div className="results-and-search">
          <div>{totalDocumentCount} Results</div>
          <div className="search-bar">
            <Box
              component="form"
              sx={{
                "& > :not(style)": { m: 1, width: "20ch" },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="outlined-basic"
                label="Search results"
                variant="outlined"
                value={findTerm}
                onChange={(evt: any) => {
                  setFindTerm(evt.target.value);
                }}
              />
            </Box>
          </div>
        </div>
      )}
      {restProps.children}
    </Toolbar.Root>
  );
};

const highlightSearchTerm = (value: string, searchTerm: string) => {
  let searchTermIndex = `${value}`.toLowerCase().indexOf(`${searchTerm}`.toLowerCase());
  let text: any = value;
  let foundSearchTerm = false;
  if (value && value.length > 0 && typeof value === "string" && searchTerm && searchTermIndex >= 0) {
    foundSearchTerm = true;

    let parts = value.split(new RegExp(searchTerm, "gi"));

    text = (
      <span>
        {parts.map((part, index) => {
          return (
            <span key={index}>
              {part}
              {index === parts.length - 1 || <b className="search-term">{searchTerm}</b>}
            </span>
          );
        })}
      </span>
    );
  }

  return { text, matched: foundSearchTerm };
};

// @ts-ignore
const TableComponent = withStyles(styles, { name: "TableComponent" })(TableComponentBase);

const ToolbarComponent = withStyles(styles, { name: "TableComponent" })(ToolbarComponentBase);

const RowColumnDetail = ({ column, value }: { column: string; value: string }) => {
  const findTerm = useStore((state) => state.findTerm);
  let { text } = highlightSearchTerm(value, findTerm);
  const [copied, setCopied] = useState(false);
  return (
    <div key={column}>
      <strong>{column}:</strong>{" "}
      <CopyToClipboard
        text={value}
        onCopy={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? (
          <Tooltip title="Copied!" placement="bottom-start" arrow>
            <span className="copy-detail-text">{text}</span>
          </Tooltip>
        ) : (
          <span className="copy-detail-text">{text}</span>
        )}
      </CopyToClipboard>
    </div>
  );
};

const RowDetail = ({ row }: { row: any }) => {
  return (
    <div>
      {Object.entries(row).map(([column, value], i) => (
        <RowColumnDetail key={`${column}-${i}`} column={column} value={value as string} />
      ))}
    </div>
  );
};

interface SearchTableProps {
  style?: React.CSSProperties;
  expandTableView: boolean;
  setExpandTableView: (expandTableView: boolean) => void;
}

const SearchTable: FC<SearchTableProps> = ({ style, expandTableView, setExpandTableView }) => {
  const documents = useStore((state) => state.documents);
  const requestFetchDocuments = useStore((state) => state.requestFetchDocuments);
  const totalDocumentCount = useStore((state) => state.totalDocumentCount);
  const loadingDocuments = useStore((state) => state.loadingDocuments);
  const requestedSkip = useStore((state) => state.requestedSkip);
  const virtualPageSize = useStore((state) => state.virtualPageSize);
  const findTerm = useStore((state) => state.findTerm);
  const [selectedDocuments, setSelectedDocuments] = useStore((state) => [
    state.selectedDocuments,
    state.setSelectedDocuments,
  ]);

  const debouncedSearchTerm = useDebounce(findTerm, 25);

  const allMappingFields = useStore((state) => state.allMappingFields);
  const filterList = useStore((state) => state.filterList);
  const [columnOrder, setColumnOrder] = useStore((state) => [state.columnOrder, state.setColumnOrder]);

  const [nonVisibleFields, setNonVisibleFields] = useStore((state) => [
    state.nonVisibleFields,
    state.setNonVisibleFields,
  ]);

  const rows = useMemo(() => {
    return documents.map((document, i) => {
      return document._source;
    });
  }, [documents]);

  const columns = useMemo(() => {
    return allMappingFields.map((field) => ({ name: field, title: field }));
  }, [allMappingFields]);

  const sortingStateColumnExtensions = useMemo(() => {
    return allMappingFields
      .filter((field) => !filterList.includes(field))
      .map((field) => ({ columnName: field, sortingEnabled: false }));
  }, [allMappingFields, filterList]);

  const TooltipFormatter = ({ value }: { value: any }) => {
    let { text, matched } = highlightSearchTerm(value, debouncedSearchTerm);
    return (
      <Tooltip title={<span className="tooltip-hover">{text}</span>} placement="bottom-start">
        <span className={`cell-text ${matched ? "found-term" : ""}`}>{text}</span>
      </Tooltip>
    );
  };

  const CellTooltip = (props: any) => (
    <DataTypeProvider for={columns.map(({ name }) => name)} formatterComponent={TooltipFormatter} {...props} />
  );

  const [columnWidths, setColumnWidths] = useState<any[]>([]);

  useEffect(() => {
    if (columnWidths.length === 0 && columns.length > 0) {
      setColumnWidths(columns.map((column: any) => ({ columnName: column.name, width: 150 })));
    }
  }, [columnWidths, columns, setColumnWidths]);

  const [sorting, setSorting] = useState<any[]>([]);
  const setSort = useStore((state) => state.setSort);

  const [fixedLeftColumns] = useState([TableSelection.COLUMN_TYPE, TableRowDetail.COLUMN_TYPE]);

  useEffect(() => {
    setSort(
      sorting.map((column) => {
        let sortingProps: any = {};
        sortingProps[column.columnName] = column.direction;
        return sortingProps;
      })
    );
  }, [sorting, setSort]);

  const matchedColumns = useMemo(() => {
    if (debouncedSearchTerm.length > 0) {
      // find term isn't empty, so we only want to show columns that have the term in them
      let allTermColumns = new Set();
      rows.slice(requestedSkip, requestedSkip + virtualPageSize).forEach((row) => {
        let termColumns = columns.filter((column) => {
          return `${row[column.name]}`.toLowerCase().indexOf(debouncedSearchTerm.toLowerCase()) >= 0;
        });
        if (termColumns.length > 0) {
          termColumns.forEach((column) => {
            allTermColumns.add(column.name);
          });
        }
      });
      return Array.from(allTermColumns).map((column) => ({ name: column as string, title: column as string }));
    } else {
      // find term is empty, so we want to show all columns
      return columns;
    }
  }, [rows, columns, debouncedSearchTerm, requestedSkip, virtualPageSize]);
  // console.log(virtualPageSize, requestedSkip);
  return (
    <Grid rows={rows} columns={matchedColumns}>
      <SearchState />
      <IntegratedFiltering />
      <SelectionState
        selection={selectedDocuments}
        onSelectionChange={(selection) => setSelectedDocuments(selection)}
      />
      <DragDropProvider />
      <SortingState sorting={sorting} onSortingChange={setSorting} columnExtensions={sortingStateColumnExtensions} />
      <IntegratedSelection />
      <RowDetailState />
      <VirtualTableState
        infiniteScrolling={false}
        loading={loadingDocuments}
        totalRowCount={totalDocumentCount}
        pageSize={virtualPageSize}
        skip={requestedSkip}
        getRows={requestFetchDocuments}
      />
      <CellTooltip />
      <VirtualTable height="calc(100vh - 180px)" tableComponent={TableComponent} />
      <TableColumnReordering order={columnOrder} onOrderChange={setColumnOrder} />
      <TableColumnResizing columnWidths={columnWidths} onColumnWidthsChange={setColumnWidths} />
      <TableHeaderRow showSortingControls />
      <TableColumnVisibility hiddenColumnNames={nonVisibleFields} onHiddenColumnNamesChange={setNonVisibleFields} />
      <TableRowDetail contentComponent={RowDetail} />
      <Toolbar rootComponent={ToolbarComponent} />
      <ColumnChooser />
      <TableSelection showSelectAll />
      <TableFixedColumns leftColumns={fixedLeftColumns} />
      <DownloadButton />
      <ExpandToggle expand={expandTableView} setExpand={setExpandTableView} />
    </Grid>
  );
};

export default SearchTable;
