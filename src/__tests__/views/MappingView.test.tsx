import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import MappingView from "../../views/MappingView";

test("Renders MappingView", async () => {
  render(<MappingView />);
});
