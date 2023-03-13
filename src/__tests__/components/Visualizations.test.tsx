import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import Visualizations from "../../components/Visualizations";

test("Renders Visualizations", async () => {
  render(<Visualizations />);
});
