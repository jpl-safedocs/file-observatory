import React, { FC, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { createTheme, Palette, PaletteOptions, ThemeProvider } from "@mui/material";

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

const AllTheProviders: FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">{children}</div>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
