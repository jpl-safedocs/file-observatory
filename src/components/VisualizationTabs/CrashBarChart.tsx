import { FC, useMemo } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

import { colors } from "./constants";

interface CrashBarChartProps {
  data: Record<string, Record<string, number>>;
  creatorToolName: string;
}

const CrashBarChart: FC<CrashBarChartProps> = ({ creatorToolName, data }) => {
  let dataBuckets = useMemo(() => {
    if (!Object.keys(data).includes(creatorToolName)) {
      return [];
    }
    return Object.entries(data[creatorToolName]).map(([key, value]: any, i: number) => ({
      name: key,
      value: value,
      fill: colors[i % colors.length],
    }));
  }, [data, creatorToolName]);

  return (
    <ResponsiveContainer width={800} minHeight={480} id="crashchart-viz">
      <BarChart data={dataBuckets} style={{ marginLeft: "15px", marginTop: "15px" }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CrashBarChart;
