import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import BarChart from "../../../components/VisualizationTabs/BarChart";

test("Renders BarChart", async () => {
  const agg = {
    field: "field",
    filter: [],
    topLabel: "Top 10",
    bottomLabel: "fields",
    tableLabel: "field",
    toolTipFieldLabel: "field",
    toolTipCountLabel: "count",
  };

  const data = {
    buckets: [
      {
        key: "a",
        doc_count: 1,
      },
      {
        key: "b",
        doc_count: 1,
      },
    ],
  };

  render(
    <BarChart
      agg={agg}
      hiddenIndices={[]}
      data={data}
      activeIndices={[]}
      removeNonPermanentIndices={jest.fn()}
      togglePermanentIndex={jest.fn()}
      hoverIndex={jest.fn()}
    />
  );
});
