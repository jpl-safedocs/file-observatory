import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import { Grid, Table, Toolbar } from "@devexpress/dx-react-grid-material-ui";

import ExpandToggle from "../../components/ExpandToggle";

test("Renders ExpandToggle", async () => {
  render(
    <Grid rows={[]} columns={[]}>
      <Table />
      <Toolbar />
      <ExpandToggle expand={false} setExpand={jest.fn()} />
    </Grid>
  );
});
