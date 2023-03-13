import { FC, useEffect, useState } from "react";

import { createTheme, Palette, PaletteOptions, ThemeProvider, CircularProgress } from "@mui/material";

import Header from "./components/Header";
import useStore from "./utils/store";
import MappingView from "./views/MappingView";
import HelpView from "./views/HelpView";
import SearchView from "./views/SearchView";
import SettingsView from "./views/SettingsView";

const { ipcRenderer } = window.require("electron");

declare module "@mui/material/styles" {
  interface Theme {
    palette: Palette;
  }

  interface ThemeOptions {
    palette?: PaletteOptions;
  }
}

var theme = createTheme({
  palette: {},
});

interface TabPanelProps {
  component?: React.ReactNode;
  index: number;
}

const TabPanel: FC<TabPanelProps> = ({ component, index }) => {
  const activePage = useStore((state) => state.activePage);

  return (
    <div
      role="tabpanel"
      hidden={activePage !== index}
      id={`page-${index}`}
      aria-labelledby={`page-${index}`}
      style={{ marginTop: "50px" }}
    >
      {activePage === index && <div>{component}</div>}
    </div>
  );
};

interface LoadingOverlayProps {
  loading: boolean;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ loading }) => {
  return loading ? (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        background: "rgba(255,255,255,0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <CircularProgress size="100px" thickness={8} disableShrink />
    </div>
  ) : null;
};

const App: FC = () => {
  const fetchIndexMapping = useStore((state) => state.fetchIndexMapping);
  const fetchDocuments = useStore((state) => state.fetchDocuments);
  const validIndex = useStore((state) => state.validIndex);
  const query = useStore((state) => state.query);
  const sort = useStore((state) => state.sort);
  const fullConfig = useStore((state) => state.fullConfig);
  const [importConfig, exportConfig] = useStore((state) => [state.importConfig, state.exportConfig]);
  const [initLoad, setInitLoad] = useState(false);
  const [syncTriggered, setSyncTriggered] = useState(false);

  useEffect(() => {
    ipcRenderer.on("config-syncd", (evt: any, info: any) => {
      if (info["trigger"] === "init") {
        if (Object.keys(info["config"]).length > 0) {
          importConfig(info["config"]);
        } else {
          setInitLoad(true);
        }
      }
    });
    if (!syncTriggered) {
      ipcRenderer.send("sync-config", { trigger: "init" });
      setSyncTriggered(true);
    }
  }, [importConfig, setInitLoad, syncTriggered]);

  useEffect(() => {
    if (!initLoad && Object.keys(fullConfig).length > 0) {
      setTimeout(() => {
        setInitLoad(true);
      }, 1000);
    }
  }, [fullConfig, setInitLoad, initLoad]);

  useEffect(() => {
    setInterval(() => {
      ipcRenderer.send("sync-config", { config: exportConfig(), trigger: "sync" });
    }, 1000 * 10);
  }, [exportConfig]);

  useEffect(() => {
    if (validIndex) {
      fetchDocuments();
    }
  }, [fetchDocuments, query, validIndex]);

  useEffect(() => {
    if (sort && sort.length > 0) {
      fetchDocuments(sort);
    }
  }, [fetchDocuments, sort]);

  useEffect(() => {
    fetchIndexMapping();
  }, [fetchIndexMapping]);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <LoadingOverlay loading={!initLoad} />
        <Header />
        <TabPanel index={0} component={<SearchView />} />
        <TabPanel index={1} component={<HelpView />} />
        <TabPanel index={2} component={<MappingView />} />
        <TabPanel index={3} component={<SettingsView />} />
      </div>
    </ThemeProvider>
  );
};

export default App;
