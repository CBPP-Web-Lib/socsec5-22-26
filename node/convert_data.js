const Papa = require("papaparse")
const fs = require("fs")

const csv = fs.readFileSync("./src.csv", "utf-8");
const csv_arr = Papa.parse(csv).data;

var header_row = 9;
var total_row = 10;

const defs = [
  {
    name: "Muscoloskeletal",
    rows: [31]
  },
  {
    name: "Mental health",
    rows: [21, 23, 24],
    bottom_margin: 50
  },
  {
    name: "Circulatory system; blood\n and blood-forming organs",
    rows: [27, 28, 33]
  },
  {
    name: "Nervous system, skin and\n sense organs",
    rows: [32, 34]
  },
  {
    name: "Endocrine; respiratory,\n genitourinary; digestive",
    rows: [12, 29, 30]
  },
  {
    name: "Intellectual and\n developmental",
    rows: [16, 17, 18, 19]
  },
  {
    name: "Other conditions",
    rows: [11, 13, 14, 22, 25]
  }
];

function csv_row(n) {
  return csv_arr[n-1].slice(2, 8);
}

const data = [];
const headers = csv_row(header_row);
defs.forEach((def) => {
  var dataset = {};
  var name = def.name.split("\n");
  name.forEach((line, i) => {
    name[i] = line.trim()
  })
  dataset.name = name;
  dataset.data = {};
  headers.forEach((header, j) => {
    dataset.data[header] = 0;
  });
  def.rows.forEach((row_n) => {
    var data_row = csv_row(row_n);
    headers.forEach((header, j) => {
      dataset.data[header] += data_row[j].replace(/\,/g,"")*1;
    });
  })
  if (def.bottom_margin) {
    dataset.bottom_margin = def.bottom_margin
  }
  data.push(dataset);
})

fs.writeFileSync("./data.json", JSON.stringify(data, null, " "), "utf-8");