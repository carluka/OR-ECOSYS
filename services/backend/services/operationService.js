const operationRepo = require("../repositories/operationRepo");
const influx = require("../utils/influx");

class OperationService {
  async listOperations() {
    return operationRepo.findAll();
  }

  async getOperation(id) {
    return operationRepo.findById(id);
  }

  async createOperation(payload) {
    return operationRepo.create(payload);
  }

  async updateOperation(id, payload) {
    return operationRepo.update(id, payload);
  }

  async deleteOperation(id) {
    return operationRepo.delete(id);
  }

  generateLabel(field) {
    const fieldMappings = {
      "metrics_bpd.ch0.nibp_module": "Diastolic Blood Pressure",
      "metrics_bps.ch0.nibp_module": "Systolic Blood Pressure",
      "metrics_bpa.ch0.nibp_module": "Artery Blood Pressure",

      "metrics_co2.ch0.capnograph": "CO2 koncentracija",
      "metrics_rf.ch0.capnograph": "Resporatory Frequency",

      "metrics_heartRate.ch0.ecg_module": "Hearzt Rate",
      "metrics_rrInterval.ch0.ecg_module": "Interval RR",
      "metrics_qrsDuration.ch0.ecg_module": "QRS Duration",

      "metrics_flowRate.ch0.infusion_pump": "Flow Rate",
      "metrics_volumeTotal.ch0.infusion_pump": "Volume Total",

      "metrics_vol.ch0.mechanical_ventilator": "Tidal Volume",
      "metrics_ox_con.ch0.mechanical_ventilator": "Fraction of Inspired Oxygen",
      "metrics_rf.ch0.mechanical_ventilator": "Respiratory Rate",
      "metrics_pip.ch0.mechanical_ventilator":
        "PIP (Peak Inspiratory Pressure)",
      "metrics_peep.ch0.mechanical_ventilator":
        "PEEP (Positive End-Expiratory Pressure)",

      "metrics_temperature.ch0.temperature_gauge": "Temperature",

      "metrics_oxygen_saturation.ch0.spo2": "Oxygen Saturation",
    };

    return fieldMappings[field] || field;
  }

  getUnit(field) {
    const unitMappings = {
      "metrics_bpd.ch0.nibp_module": "mmHg",
      "metrics_bps.ch0.nibp_module": "mmHg",
      "metrics_co2.ch0.capnograph": "mmHg",
      "metrics_hr.ch0.ecg_module": "bpm",
      "metrics_spo2.ch0.pulse_oximeter": "%",
      "metrics_temp.ch0.temperature_sensor": "°C",
    };

    return unitMappings[field] || "";
  }

  transformInfluxData(influxResults) {
    console.log(
      `Starting transformation of ${influxResults.length} raw measurements`
    );

    const groupedData = {};

    influxResults.forEach((row) => {
      const key = `${row._field}_${row.device_id}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          field: row._field,
          deviceId: row.device_id,
          data: [],
        };
      }

      const correctedTime = this.correctTimeOffset(row._time);

      groupedData[key].data.push({
        time: correctedTime,
        value: row._value,
      });
    });

    const measurementGroups = Object.values(groupedData).map((group) => {
      const label = this.generateLabel(group.field);
      const unit = this.getUnit(group.field);

      group.data.sort((a, b) => new Date(a.time) - new Date(b.time));

      console.log(
        `Created group: ${label} with ${group.data.length} data points`
      );

      return {
        label,
        deviceId: group.deviceId,
        field: group.field,
        unit,
        data: group.data,
      };
    });

    console.log(
      `Transformation complete: ${measurementGroups.length} groups created`
    );
    return measurementGroups;
  }

  correctTimeOffset(isoTimeString) {
    const date = new Date(isoTimeString);
    date.setSeconds(date.getSeconds() + 1);
    return date.toISOString();
  }

  async getOperationWithMeasurements(id) {
    const operation = await operationRepo.findById(id);

    if (!operation) throw new Error("Operacija ne obstaja");

    const { datum, cas_zacetka, cas_konca, Soba } = operation;
    const roomUuid = Soba.uuid;

    // Funkcija za pretvorbo lokalnega časa v UTC minus 2 uri
    const toISOStringMinus2Hours = (dateStr, timeStr) => {
      const localTime = new Date(`${dateStr}T${timeStr}`);
      localTime.setHours(localTime.getHours() - 2);
      return localTime.toISOString();
    };

    const start = toISOStringMinus2Hours(datum, cas_zacetka);

    const endDate = new Date(`${datum}T${cas_konca}`);
    endDate.setHours(endDate.getHours() - 2);
    endDate.setSeconds(endDate.getSeconds() + 1);
    const stop = endDate.toISOString();

    console.log(
      `Fetching measurements for operation ${roomUuid} from ${start} to ${stop}`
    );

    const rawMeasurements = await influx.queryMeasurements(
      roomUuid,
      start,
      stop
    );
    console.log(`Raw measurements received: ${rawMeasurements.length}`);

    const transformedMeasurements = this.transformInfluxData(rawMeasurements);

    return {
      ...operation.toJSON(),
      meritve: transformedMeasurements,
    };
  }
}

module.exports = new OperationService();
