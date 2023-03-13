import React from "react";
import { render } from "../../../test-utils";
import "@testing-library/jest-dom";

import SigTerms from "../../../components/VisualizationTabs/SigTerms";

test("Renders SigTerms", async () => {
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
    <SigTerms
      hiddenIndices={[]}
      setHiddenIndices={jest.fn()}
      activeIndices={[]}
      removeNonPermanentIndices={jest.fn()}
      togglePermanentIndex={jest.fn()}
      hoverIndex={jest.fn()}
    />
  );
});
