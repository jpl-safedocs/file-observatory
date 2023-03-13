import { FC, useMemo, ReactElement } from "react";
import { Pie, PieChart, ResponsiveContainer, Sector } from "recharts";

import { ActiveIndexProps } from "../Visualizations";

import { colors } from "./constants";

const renderActiveShape: ReactElement<SVGElement> | ((props: any) => any) = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
  name,
  hide,
  topLabel,
  bottomLabel,
  toolTipFieldLabel,
  toolTipCountLabel,
}) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";
  return (
    <g>
      {topLabel ? (
        <text x={cx} y={cy} dy={-8} textAnchor="middle">
          {topLabel}
        </text>
      ) : null}
      {bottomLabel ? (
        <text x={cx} y={cy} dy={16} textAnchor="middle">
          {bottomLabel}
        </text>
      ) : null}
      {!hide ? (
        <>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle + 2}
            endAngle={endAngle - 2}
            fill={fill}
            style={{ cursor: "pointer" }}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle + 2}
            endAngle={endAngle - 2}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} dy={-10} y={ey} textAnchor={textAnchor} fill="#333">
            {`${toolTipFieldLabel}: ${name}`}
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={5}
            textAnchor={textAnchor}
            fill="#333"
          >{`${toolTipCountLabel}: ${value}`}</text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={25} textAnchor={textAnchor} fill="#999">
            {`${(percent * 100).toFixed(2)}%`}
          </text>
        </>
      ) : null}
    </g>
  );
};

interface DonutChartProps {
  agg: any;
  data: Record<string, any>;
  hiddenIndices: number[];
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const DonutChart: FC<DonutChartProps> = ({
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
      .filter((bucket: any, i: number) => i < 10)
      .map((bucket: any, i: number) => ({
        name: bucket.key,
        value: bucket.doc_count,
        topLabel: agg.topLabel,
        bottomLabel: agg.bottomLabel,
        toolTipFieldLabel: agg.toolTipFieldLabel,
        toolTipCountLabel: agg.toolTipCountLabel,
        fill:
          activeIndices.filter((index) => index.index === i).length &&
          activeIndices.filter((index) => index.index === i)[0].fill
            ? activeIndices.filter((index) => index.index === i)[0].fill
            : colors[i % colors.length],
      }))
      .filter((bucket: any, i: number) => !hiddenIndices.includes(i));
  }, [data, activeIndices, hiddenIndices, agg]);

  return (
    <div>
      <ResponsiveContainer height={480} id="pie-viz">
        <PieChart>
          <Pie
            activeIndex={activeIndices.map((i) => i.index)}
            activeShape={renderActiveShape}
            dataKey="value"
            data={
              dataBuckets.length
                ? dataBuckets
                : [
                    {
                      hide: true,
                      topLabel: agg.topLabel,
                      bottomLabel: agg.bottomLabel,
                      value: 0,
                      fill: "black",
                    },
                  ]
            }
            innerRadius={100}
            outerRadius={140}
            fill="#8884d8"
            onMouseOver={(data: any, index: number) => hoverIndex(index)}
            onMouseLeave={(data: any, index: number) => removeNonPermanentIndices(index)}
            onMouseDown={(data: any, index: number) => togglePermanentIndex(index)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
