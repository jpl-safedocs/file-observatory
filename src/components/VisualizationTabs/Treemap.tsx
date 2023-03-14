/**
 * Copyright (c) 2018-2023 California Institute of Technology ("Caltech"). U.S.
 * Government sponsorship acknowledged.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Caltech nor its operating division, the Jet Propulsion
 *   Laboratory, nor the names of its contributors may be used to endorse or
 *   promote products derived from this software without specific prior written
 *   permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { FC, useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip, Label } from "recharts";

import { ActiveIndexProps } from "../Visualizations";

import { colors } from "./constants";

interface TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

const TooltipContents: FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: "white", padding: "5px 15px" }}>
        <p className="label">{`${payload[0].payload.longName} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

interface TreemapVizProps {
  agg?: any;
  data: Record<string, any>;
  hiddenIndices: number[];
  activeIndices: ActiveIndexProps[];
  sizeField?: string;
  removeNonPermanentIndices: (index: number) => void;
  togglePermanentIndex: (index: number) => void;
  hoverIndex: (index: number) => void;
}

const TreemapViz: FC<TreemapVizProps> = ({
  agg,
  data,
  hiddenIndices,
  activeIndices,
  sizeField = "doc_count",
  removeNonPermanentIndices,
  togglePermanentIndex,
  hoverIndex,
}) => {
  let dataBuckets = useMemo(() => {
    let buckets = data.buckets.sort((a: any, b: any) => (a[sizeField] > b[sizeField] ? -1 : 1));
    buckets = buckets.filter((bucket: any, i: number) => !agg || !agg.filter.includes(bucket.key));
    return buckets
      .filter((bucket: any, i: number) => i < 25)
      .map((bucket: any, i: number) => ({
        name: bucket.key.length > 25 ? `${bucket.key.slice(0, 25)}...` : bucket.key,
        longName: bucket.key,
        count: bucket[sizeField],
        fill:
          activeIndices.filter((index) => index.index === i).length &&
            activeIndices.filter((index) => index.index === i)[0].fill
            ? activeIndices.filter((index) => index.index === i)[0].fill
            : colors[i % colors.length],
      }))
      .filter((bucket: any, i: number) => !hiddenIndices.includes(i));
  }, [data, activeIndices, hiddenIndices, agg, sizeField]);

  return (
    <div style={{ margin: "5px" }}>
      <ResponsiveContainer height={480} id="bubble-chart-viz">
        <Treemap data={dataBuckets} dataKey="count" stroke="#fff" fill="#8884d8" animationDuration={250}>
          <Tooltip content={<TooltipContents />} />
          <Label value="any" />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default TreemapViz;
