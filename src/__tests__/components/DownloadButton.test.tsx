import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import { Grid, Table, Toolbar } from "@devexpress/dx-react-grid-material-ui";

import DownloadButton from "../../components/DownloadButton";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

test("Renders DownloadButton Plugin", async () => {
  render(
    <Grid rows={[]} columns={[]}>
      <Table />
      <Toolbar />
      <DownloadButton />
    </Grid>
  );
});
