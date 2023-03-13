import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

jest.mock(
  "electron",
  () => {
    const mElectron = { ipcRenderer: { on: jest.fn(), send: jest.fn() } };
    return mElectron;
  },
  { virtual: true }
);

test("Renders App", async () => {
  render(<App />);

  await waitFor(() => screen.getByText("Search"));

  expect(screen.getAllByText("No data")).toBeTruthy();
});
