/**

 */
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const height = 90; // height of the total bar chart area in px
const width = 300; // width of the totla bar char area in px
const margin = { left: 30, right: 20, top: 20, bottom: 20 }; // for axes
const hourColorInterpolator = d3.interpolateRdYlGn; // color scale
const today = new Date(); // for "now" indicator

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getExtent = (allotments) => {
  const extent = {
    hours: d3.max(allotments, (a) => a.hours),
    start: d3.min(allotments, (a) => new Date(a.start)),
    end: d3.max(allotments, (a) => new Date(a.end)),
  };
  extent.timeDomain = [extent.start, extent.end];
  return extent;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getScales = (extent) => {
  return {
    x: d3
      .scaleTime()
      .domain(extent.timeDomain)
      .range([margin.left, width - margin.right]),
    y: d3
      .scaleLinear()
      .domain([0, extent.hours])
      .range([height - margin.bottom, margin.top]),
    color: d3
      .scaleSequential()
      .domain([0, extent.hours])
      .interpolator(hourColorInterpolator),
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const bars = (allotments, scales) => {
  const b = allotments.map((a) => {
    const x = scales.x(new Date(a.start));
    const y = scales.y(a.hours);
    return {
      x,
      y,
      width: scales.x(new Date(a.end)) - x,
      height: scales.y(0) - y,
      color: scales.color(a.hours),
    };
  });
  b.push({
    x: scales.x(today),
    y: margin.top / 2,
    width: 2,
    height: height - margin.bottom,
    color: "red",
  });
  return b;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ProjectLocationHours = ({ allotments }) => {
  const container = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  useEffect(() => {
    if (!allotments || !container.current) {
      return;
    }
    const extent = getExtent(allotments);
    const scales = getScales(extent);
    const allotmentBars = bars(allotments, scales);
    const svg = d3.select(container.current);
    const update = svg.selectAll("rect").data(allotmentBars);
    update
      .enter()
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.color);
    update.exit().remove();
    const xAxis = d3.axisBottom(scales.x).ticks(4);
    const yAxis = d3.axisLeft(scales.y).ticks(3);
    d3.select(xAxisRef.current).call(xAxis);
    d3.select(yAxisRef.current).call(yAxis);
  }, [allotments]);

  return (
    <svg width={width} height={height} ref={container}>
      <g
        ref={xAxisRef}
        transform={`translate(0, ${height - margin.bottom})`}
      ></g>
      <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`}></g>
    </svg>
  );
};
export default ProjectLocationHours;
