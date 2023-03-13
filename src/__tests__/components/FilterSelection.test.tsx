import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import FilterSelection from "../../components/FilterSelection";

test("Renders FilterSelection", async () => {
  render(<FilterSelection />);
});
