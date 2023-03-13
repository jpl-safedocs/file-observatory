import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import SettingsView from "../../views/SettingsView";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

test("Renders SettingsView", async () => {
  render(<SettingsView />);
});
