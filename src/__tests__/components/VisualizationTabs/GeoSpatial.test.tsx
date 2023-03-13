import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import GeoSpatial from "../../../components/VisualizationTabs/GeoSpatial";

test("Renders GeoSpatial", async () => {
  render(<GeoSpatial isMapVisible={false} />);
});
