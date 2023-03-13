import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import SearchTable from "../../components/SearchTable";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

test("Renders SearchTable", async () => {
  render(<SearchTable expandTableView={true} setExpandTableView={jest.fn()} />);
});
