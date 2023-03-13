import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import Kibana from "../../../components/VisualizationTabs/Kibana";

test("Renders Kibana", async () => {
  render(<Kibana />);
});
