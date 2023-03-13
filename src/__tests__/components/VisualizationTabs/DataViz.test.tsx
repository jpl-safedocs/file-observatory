import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import DataViz from "../../../components/VisualizationTabs/DataViz";

test("Renders DataViz", async () => {
  render(
    <DataViz
      hiddenIndices={[]}
      setHiddenIndices={jest.fn()}
      activeIndices={[]}
      removeNonPermanentIndices={jest.fn()}
      togglePermanentIndex={jest.fn()}
      hoverIndex={jest.fn()}
    />
  );
});
