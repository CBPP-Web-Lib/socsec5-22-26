import "./style.scss";
import * as d3 from "d3";
import commaNumber from "comma-number";

const id = "socsec5-22-26"
const script_id = "script_" + id
const sel = "#" + id
const script_sel = "#" + script_id

/*Gets the correct base URL regardless of whether we're on the test apps.cbpp.org page or the real cbpp.org page*/
const url_base = document.querySelector(script_sel).src.replace(/js\/app(\.min)*\.js/g,"").split("?")[0]

import data from "../data.json";

const width = 940;
const left_margin = 250;
const right_margin = 100;
const box_height = 50;
const box_gap = 16;
const bottom_margin = 50;
const top_margin = 50;
const chart_width = width - left_margin - right_margin;
const gridline_overflow = 5;
const circle_radius = 3;
const circle_color = "#ff9500";
const circle_opacity = 0.6;

const age_widths_percent = [
  {"Under 30" : 12/(65-18)},
  {"30–39": 10/(65-18)},
  {"40–49": 10/(65-18)},
  {"50–59": 10/(65-18)},
  {"60–FRA": 5/(65-18)}
];
const age_widths_gridline_text = {
  "Under 30" : 30,
  "30–39": 40,
  "40–49": 50,
  "50–59": 60,
  "60–FRA": ""
}

var inner_margin = 0;
data.forEach((item) => {
  if (item.bottom_margin) {
    inner_margin += item.bottom_margin
  }
})

const height = bottom_margin + top_margin + (box_height + box_gap)*data.length + inner_margin;
const svg = d3.select(sel).append("svg");
const viewbox = [0, 0, width, height]

svg.attr("viewBox",  viewbox.join(" "));

function group_top_offset(i) {
  var r = 0;
  var done = false;
  data.forEach((item, _i) => {
    if (i === _i) {
      done = true;
    }
    if (!done) {
      r += box_height + box_gap;
      if (item.bottom_margin) {
        r += item.bottom_margin;
      }
    }
  })
  return r;
}

new Promise((resolve, reject) => {
  var typekit = document.createElement("script")
  typekit.type = "text/javascript"
  typekit.src = "//use.typekit.net/bwe8bid.js";
  document.head.appendChild(typekit)
  typekit.onload = () => {
    Typekit.load({
      active: resolve
    })
  }
}).then(function() {

  

  svg.append("line")
    .attr("class","yaxis")
    .attr("x1", left_margin - 10)
    .attr("y1", top_margin - gridline_overflow)
    .attr("x2", left_margin - 10)
    .attr("y2", height - bottom_margin + gridline_overflow)
    .attr("stroke", "#000")
    .attr("stroke-width", 2)

  svg.append("g")
    .attr("transform","translate(0," + top_margin + ")")
    .selectAll("g.condition")
    .data(data)
    .enter()
    .append("g")
    .attr("class","condition")
    .attr("transform",(d,i)=>{return "translate(0," + group_top_offset(i) + ")"})
    .each(function(d, i) {
      make_item_group(d3.select(this), d, i === data.length - 1)
    })

  svg.append("g")
    .attr("class","gridlines")
    .selectAll("g.gridline")
    .data(Object.keys(data[0].data))
    .enter()
    .append("g")
    .attr("class","gridline")
    .each(function(d, i) {
      var x_pos = left_offset(d) + left_margin + left_width(d)
      var text = age_widths_gridline_text[d];
      if (text) {
        d3.select(this).append("line")
          .attr("x1", x_pos)
          .attr("x2", x_pos)
          .attr("y1", top_margin - gridline_overflow)
          .attr("y2", height - bottom_margin + gridline_overflow)
          .attr("stroke-width", 1)
          .attr("stroke","#aaa")
        d3.select(this)
          .append("text")
          .text(age_widths_gridline_text[d]+"")
          .attr("x", x_pos)
          .attr("text-anchor","middle")
          .attr("y", height - bottom_margin + gridline_overflow+15)
      }
    })
})


function left_offset(name) {
  var acc = 0;
  var done = false;
  age_widths_percent.forEach((item) => {
    var label = Object.keys(item)[0];
    var value = Object.values(item)[0];
    if (label === name) {
      done = true;
    }
    if (!done) {
      acc += value;
    }
  })
  return acc*chart_width;
}

function left_width(name) {
  var result = 0;
  age_widths_percent.forEach((item) => {
    var label = Object.keys(item)[0];
    var value = Object.values(item)[0];
    if (label === name) {
      result = value;
    }
  })
  return result*chart_width;
}

function make_item_group(g, data, last) {
  var d = [];
  Object.keys(data.data).forEach((age) => {
    if (age !== "Total") {
      d.push({name: age, value: data.data[age]})
    }
  })
  var name = data.name;
  var yoff = 5 -(name.length-1)*10
  name.forEach((line, i) => {
    g.append("text")
      .text(line)
      .attr("text-anchor","end")
      .attr("x", left_margin - 20)
      .attr("y", box_height/2 + i*20 + yoff)
  })
  
  g.append("g")
    .attr("class","dots-area")
    .attr("transform","translate(" + left_margin + ",0)")
    .selectAll("g.dot-box")
    .data(d)
    .enter()
    .append("g")
    .attr("class","dot-box")
    .attr("transform",(d,i) =>{
      return "translate(" + left_offset(d.name) + ",0)"
    })
    .each(function(d, i) {
      var width = left_width(d.name)
      make_dot_box(d3.select(this), d, width)
    })

  var n_label = g.append("g")
    .attr("class","data-label")
  n_label.attr("transform", "translate(" + (width - right_margin) + "," + 5 + ")");
  var person = make_person(n_label)
  person.attr("transform","translate(7," + (10) + ")")
  n_label.append("text")
    .text(format_data_label(data.data["Total"]))
    .attr("dy", 25)
    .attr("dx", 30)

  if (data.bottom_margin) {
    g.append("rect")
      .attr("fill", "#fff")
      .attr("width", width)
      .attr("height", data.bottom_margin - 2*gridline_overflow)
      .attr("x", 0)
      .attr("y", box_height + gridline_overflow)
  } else if (!last) {
    g.append("line")
      .attr("y1", box_height + box_gap/2)
      .attr("y2", box_height + box_gap/2)
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
  }
  
}

function format_data_label(n) {
  if (n < 1000000) {
    return commaNumber(Math.round(n/1000)*1000);
  } else {
    return Math.round(n/100000)/10 + " mil.";
  }
}

function make_dot_box(box, data, width) {
  var n_dots = Math.round(data.value/1000);
  for (var i = 0; i < n_dots; i++) {
    box.append("circle")
      .attr("r",circle_radius)
      .attr("cx", Math.random()*width)
      .attr("cy", Math.random()*box_height)
      .attr("fill", circle_color)
      .attr("opacity", circle_opacity)
  }
} 

function make_person(container) {
  var g = container.append("g")
  g.append("path")
    .attr("d", 'M0,18a10,10 0 0 1 20,0L0,18z')
    .attr("fill", "#666");
  g.append("circle")
    .attr("cx", 10)
    .attr("cy", 5)
    .attr("r", 5)
    .attr("fill", "#666")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.8)
  return g;
}