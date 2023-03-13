import { FC, useMemo } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

import { ActiveIndexProps } from "../Visualizations";

import { colors } from "./constants";

interface BarChartVizProps {
  agg: any;
  data: Record<string, any>;
  hiddenIndices: number[];
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const BarChartViz: FC<BarChartVizProps> = ({
  agg,
  data,
  hiddenIndices,
  activeIndices,
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  let dataBuckets = useMemo(() => {
    let buckets = data.buckets.sort((a: any, b: any) => (a.doc_count > b.doc_count ? -1 : 1));
    buckets = buckets.filter((bucket: any, i: number) => !agg.filter.includes(bucket.key));
    return buckets
      .filter((bucket: any, i: number) => i < 25)
      .map((bucket: any, i: number) => ({
        name: bucket.key,
        count: bucket.doc_count,
        fill:
          activeIndices.filter((index) => index.index === i).length &&
          activeIndices.filter((index) => index.index === i)[0].fill
            ? activeIndices.filter((index) => index.index === i)[0].fill
            : colors[i % colors.length],
      }))
      .filter((bucket: any, i: number) => !hiddenIndices.includes(i));
  }, [data, activeIndices, hiddenIndices, agg]);

  return (
    <ResponsiveContainer width={800} minHeight={480} id="barchart-viz">
      <BarChart data={dataBuckets} style={{ marginLeft: "15px", marginTop: "15px" }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="count"
          fill="#82ca9d"
          onMouseOver={(data: any, index: number) => hoverIndex(index)}
          onMouseLeave={(data: any, index: number) => removeNonPermanentIndices(index)}
          onMouseDown={(data: any, index: number) => togglePermanentIndex(index)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartViz;
