require('dotenv').config();
const { InfluxDB } = require('@influxdata/influxdb-client');

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = "vital_signs";

const client = new InfluxDB({ url, token });

async function queryMeasurements(roomId, start, stop) {
  const queryApi = client.getQueryApi(org);

const fluxQuery = `
  from(bucket: "${bucket}")
    |> range(start: time(v: "${start}"), stop: time(v: "${stop}"))
    |> filter(fn: (r) => r["_measurement"] == "kafka_consumer")
    |> filter(fn: (r) => r["room_id"] == "${roomId}")
    |> limit(n: 1000)
`;

  console.log("Flux query:", fluxQuery);

  const results = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error) {
        console.error("InfluxDB query error:", error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

module.exports = {
  queryMeasurements,
};
