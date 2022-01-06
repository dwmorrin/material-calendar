import React, { useRef, useEffect, FunctionComponent } from "react";
import * as d3 from "d3";
import { ProjectAllotment } from "../../resources/Project";
import {
  addDays,
  differenceInHoursSQLDatetime,
  nowInServerTimezone,
  parseSQLDate,
} from "../../utils/date";
import Event from "../../resources/Event";

const height = 90; // height of the total bar chart area in px
const width = 300; // width of the total bar char area in px
const margin = { left: 30, right: 20, top: 20, bottom: 20 }; // for axes
const today = nowInServerTimezone(); // for "now" indicator

interface AllotmentExtent {
  hours: number;
  start: Date;
  end: Date;
}

interface AllotmentScales {
  x: d3.ScaleTime<number, number>;
  y: d3.ScaleLinear<number, number>;
}

interface AllotmentBar {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface BarableObj {
  start: string;
  end: string;
  hours: number;
  isEvent?: boolean;
}

const getScales = (extent: AllotmentExtent): AllotmentScales => {
  return {
    x: d3
      .scaleTime()
      .domain([extent.start, extent.end])
      .range([margin.left, width - margin.right]),
    y: d3
      .scaleLinear()
      .domain([0, extent.hours])
      .range([height - margin.bottom, margin.top]),
  };
};

const eventToBarable = (event: Event): BarableObj => ({
  start: event.start.split(" ")[0],
  end: event.end.split(" ")[0],
  hours: differenceInHoursSQLDatetime(event),
  isEvent: true,
});

const getExtent = (allotments: BarableObj[]): AllotmentExtent => {
  return {
    hours: d3.max(allotments, (a) => a.hours) || 0,
    start: d3.min(allotments, (a) => parseSQLDate(a.start)) || new Date(),
    end:
      d3.max(allotments, (a) => addDays(parseSQLDate(a.end), 1)) || new Date(),
  };
};

const bars = (
  barables: BarableObj[],
  scales: AllotmentScales,
  colors: { allotment: string; event: string; now: string }
): AllotmentBar[] => {
  const b = barables.map(({ start, end, hours, isEvent }) => {
    const x = scales.x(parseSQLDate(start)) as number;
    const y = scales.y(hours) as number;
    return {
      x,
      y,
      width: (scales.x(addDays(parseSQLDate(end), 1)) as number) - x,
      height: (scales.y(0) as number) - y,
      color: isEvent ? colors.event : colors.allotment,
    };
  });
  b.push({
    x: scales.x(today) as number,
    y: margin.top / 2,
    width: 2,
    height: height - margin.bottom,
    color: colors.now,
  });
  return b;
};

interface ProjectLocationHoursProps {
  allotments: ProjectAllotment[];
  events?: Event[];
  colors: { allotment: string; event: string; now: string };
}

const ProjectLocationHours: FunctionComponent<ProjectLocationHoursProps> = ({
  allotments,
  events = [] as Event[],
  colors,
}) => {
  const container = useRef(null);
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  useEffect(() => {
    if (!allotments || !container.current) {
      return;
    }
    const barableEvents = [...allotments, ...events.map(eventToBarable)];
    const extent = getExtent(barableEvents);
    const scales = getScales(extent);
    const allotmentBars = bars(barableEvents, scales, colors);
    const svg = d3.select(container.current);
    const update = svg.selectAll("rect").data(allotmentBars);
    update
      .enter()
      .append("rect")
      .merge(update as never)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.color);
    update.exit().remove();
    const xAxis = d3.axisBottom(scales.x).ticks(4);
    const yAxis = d3.axisLeft(scales.y).ticks(3);
    d3.select(xAxisRef.current).call(xAxis as never);
    d3.select(yAxisRef.current).call(yAxis as never);
  }, [allotments, events, colors]);

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
