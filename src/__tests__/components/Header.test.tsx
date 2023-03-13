import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import Header from "../../components/Header";

test("Renders Header", async () => {
  render(<Header />);
});
