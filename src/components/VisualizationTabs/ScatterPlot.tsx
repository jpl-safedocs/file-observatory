import { FC, useMemo } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Cell } from "recharts";
import useStore from "../../utils/store";

import { ActiveIndexProps } from "../Visualizations";

import { colors } from "./constants";

interface TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
  fields?: string[];
}

const TooltipContents: FC<TooltipProps> = ({ active, payload, label, fields = [] }) => {
  let key = fields.join("-");
  if (active && payload && payload.length > 0) {
    key = `${key}-${payload[0].payload.x}-${payload[0].payload.y}`;
    return (
      <div key={key} className="custom-tooltip" style={{ background: "white", padding: "5px 15px", zIndex: 9999 }}>
        {payload[0].payload.longName && <p className="label">{payload[0].payload.longName} : {payload[0].payload.count}</p>}
        {payload[0].payload.longName || <p className="label">
          <b>{fields[0] || "X"}:</b> {payload[0].payload.x}
          <br />
          <b>{fields[1] || "Y"}:</b> {payload[0].payload.y}
          <br />
          {fields.slice(2).map((field => <><b>{field}:</b> {payload[0].payload[field]}<br /></>))}
        </p>}
      </div>
    );
  }

  return <div key={key}></div>;
};

interface ScatterPlotProps {
  agg?: any;
  data: Record<string, any>;
  hiddenIndices: number[];
  activeIndices: ActiveIndexProps[];
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const ScatterPlot: FC<ScatterPlotProps> = ({
  agg,
  data,
  hiddenIndices,
  activeIndices,
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  const plotData = useStore(state => state.plotData);
  const documents = useStore(state => state.documents);
  const activeField = useStore(state => state.activeField);
  const activeYField = useStore(state => state.activeYField);
  const activeColorField = useStore(state => state.activeColorField);

  let [dataBuckets, colorLegend, xFieldType, yFieldType] = useMemo(() => {
    let xFieldType: "number" | "category" = "number";
    let yFieldType: "number" | "category" = "number";

    if (activeYField === "count") {
      if (!data || !data.buckets || data.buckets.length <= 0) {
        return [[], []];
      }
      let buckets = data.buckets.sort((a: any, b: any) => (a.doc_count > b.doc_count ? -1 : 1));
      buckets = buckets.filter((bucket: any, i: number) => !agg || !agg.filter.includes(bucket.key));

      let formattedBuckets: any[] = [];
      buckets.forEach((bucket: any, i: number) => {
        if (hiddenIndices.includes(i)) {
          return;
        }

        let xKey = bucket.key;
        if (!isNaN(xKey)) {
          xKey = Number(xKey);
        } else {
          xFieldType = "category";
        }

        let row: Record<string, any> = {
          x: xKey,
          name: bucket.key,
          longName: bucket.key,
          count: bucket.doc_count,
          y: bucket.doc_count,
          fill:
            activeIndices.filter((index) => index.index === i).length &&
              activeIndices.filter((index) => index.index === i)[0].fill
              ? activeIndices.filter((index) => index.index === i)[0].fill
              : colors[i % colors.length],
        }
        formattedBuckets.push(row);
      });
      return [formattedBuckets, [], xFieldType, yFieldType];
    } else {
      let memoColors: Record<string, string> = {};

      let memoXY: Record<string, any> = {};
      let availableData = plotData.length > 0 ? plotData : documents;
      availableData.forEach((row, i) => {
        if ([null, undefined, ""].includes(row._source[activeField]) || [null, undefined, ""].includes(row._source[activeYField])) {
          // Skip empty X,Y values
          return;
        }

        let color = "black";
        if (typeof row._source[activeColorField] === "string") {
          if (!memoColors[row._source[activeColorField]]) {
            memoColors[row._source[activeColorField]] = colors[Object.keys(memoColors).length % colors.length];
          }
          color = memoColors[row._source[activeColorField]];
        }

        let xField = null;
        if (!isNaN(row._source[activeField])) {
          xField = Number(row._source[activeField]);
        } else {
          xField = row._source[activeField];
          xFieldType = "category";
        }

        let yField = null;
        if (!isNaN(row._source[activeYField])) {
          yField = Number(row._source[activeYField]);
        } else {
          yField = row._source[activeYField];
          yFieldType = "category";
        }

        let colorField = row._source[activeColorField] || null;

        let memoKey = `${xField},${yField}`;
        if (memoXY[memoKey] !== undefined) {
          memoXY[memoKey].count += 1;
          memoXY[memoKey].colors.push(colorField);
        } else {
          memoXY[memoKey] = {
            fill: color,
            x: xField,
            y: yField,
            colors: [colorField],
            count: 1
          };
        }
      });

      availableData = Object.entries(memoXY).map(([key, point]) => {
        return {
          ...point,
          colors: point.colors.join(",")
        };
      }).filter((point) => point !== null).sort((pointA, pointB) => pointB?.x === null || (pointA?.x !== null && pointB?.x !== null && pointA?.x > pointB?.x) ? 1 : -1);

      let colorLegend = Object.entries(memoColors).map(([value, color]) => ({ value, color }))
      console.log(colorLegend, colorLegend.length)
      return [availableData, colorLegend, xFieldType, yFieldType];
    }
  }, [data, activeIndices, hiddenIndices, agg, activeYField, activeColorField, plotData, documents, activeField]);

  return (
    <div style={{ margin: "5px" }}>
      <ResponsiveContainer height={480} id="scatterplot-viz">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            name={activeField}
            type={xFieldType}
            tickFormatter={(value) => xFieldType === "number" ? value.toPrecision(2) : value}
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="y"
            name={activeYField}
            type={yFieldType}
            tickFormatter={(value) => yFieldType === "number" ? value.toPrecision(2) : value}
            allowDuplicatedCategory={false}
          />
          {colorLegend.length <= 15 && <Legend payload={colorLegend} dy={10} />}
          <Tooltip content={<TooltipContents fields={[activeField, activeYField, "colors", "count"]} />} />
          <Scatter data={dataBuckets} fill="#8884d8">
            {dataBuckets.map((data: any, index: number) => {
              return <Cell key={`cell-${index}`} />
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlot;
