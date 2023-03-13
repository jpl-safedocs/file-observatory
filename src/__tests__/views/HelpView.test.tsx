import React from "react";
import { render } from "../../test-utils";
import "@testing-library/jest-dom";

import HelpView from "../../views/HelpView";

test("Renders HelpView", async () => {
  render(<HelpView />);
});
