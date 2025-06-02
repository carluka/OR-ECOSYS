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

async function deleteRoomData(roomUuid) {
  try {

    const deleteUrl = `${url}/api/v2/delete?org=${encodeURIComponent(org)}&bucket=${encodeURIComponent(bucket)}`;
    
    const predicate = `room_id="${roomUuid}"`;
    const start = '1970-01-01T00:00:00Z';
    const stop = new Date().toISOString();

    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start,
        stop,
        predicate
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${await response.text()}`);
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  queryMeasurements,
  deleteRoomData
};