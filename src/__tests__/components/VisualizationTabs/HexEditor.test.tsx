import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import HexEditor from "../../../components/VisualizationTabs/HexEditor";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

test("Renders HexEditor", async () => {
  render(<HexEditor />);
});
