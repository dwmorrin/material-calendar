import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const height = 90;
const width = 300;
const margin = { left: 30, right: 20, top: 20, bottom: 20 };

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ProjectLocationHours = ({ data }) => {
  const container = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  useEffect(() => {
    if (!data || !container.current) {
      return;
    }
    const start = d3.min(data, (a) => a.start);
    const end = d3.max(data, (a) => a.end);
    const maxHours = d3.max(data, (a) => a.hours);
    if (start === undefined || end === undefined || maxHours === undefined) {
      return;
    }
    const x = d3
      .scaleTime()
      .domain([start, end])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, maxHours])
      .range([height - margin.bottom, margin.top]);
    const color = d3
      .scaleSequential()
      .domain([0, maxHours])
      .interpolator(d3.interpolateRdYlGn);
    const bars = data.map((a) => {
      const _x = x(a.start);
      const _y = y(a.hours);
      const dx = x(a.end) - _x;
      const dy = y(0) - _y;
      return {
        x: _x,
        y: _y,
        width: dx,
        height: dy,
        fill: color(a.hours),
      };
    });
    const today = new Date();
    bars.push({
      x: x(today),
      y: margin.top / 2,
      width: 2,
      height: height - margin.bottom,
      fill: "red",
    });
    const svg = d3.select(container.current);
    const update = svg.selectAll("rect").data(bars);
    update
      .enter()
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.fill);
    update.exit().remove();
    const xAxis = d3.axisBottom(x).ticks(4);
    const yAxis = d3.axisLeft(y).ticks(3);
    d3.select(xAxisRef.current).call(xAxis);
    d3.select(yAxisRef.current).call(yAxis);
  }, [data]);

  console.log("rendering", { data });
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
