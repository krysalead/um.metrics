import { createRequire } from "module";
const require = createRequire(import.meta.url);

const {
  InfluxDB,
  Point,
  IllegalArgumentError,
} = require("@influxdata/influxdb-client");

const isFloat = (possibleFloatValue) => {
  return !isNaN(parseFloat(possibleFloatValue));
};

const isUndefined = (o) => o === null || o === undefined;

const hasValidParams = function () {
  return (
    Array.prototype.filter.call(arguments, (args) => isUndefined(args))
      .length == 0
  );
};

const InfluxDbConnector = (url, buckertName, username, password) => {
  if (!hasValidParams(url, buckertName)) {
    throw `You need to pass a valid url and buckername (${[url, buckertName]})`;
  }
  console.log("Influx ::Creating client for ", url);
  console.log(InfluxDB);
  const influxInstance = new InfluxDB({
    url: url,
    token: `${username}:${password}`,
  });
  let counter = 0;
  const writeApi = influxInstance.getWriteApi("", buckertName);

  return {
    push: (type, name, value, tag, tagValue) => {
      console.log(
        `Influx :: Pushing ${type}, ${name}, ${value}, ${tag}, ${tagValue}`
      );
      const dataPoint = new Point(type);
      if (tag != undefined && tagValue != undefined) {
        dataPoint.tag(tag, tagValue);
      }
      if (name != undefined && value != undefined && isFloat(value)) {
        dataPoint.floatField(name, value);
      } else {
        dataPoint.stringField(name, value);
      }

      writeApi.writePoint(dataPoint);
      console.log(`Sent point: ${dataPoint}`);
      counter++;
      if (counter > 10) {
        counter = 0;
        console.log(`Flushing...`);
        writeApi.flush();
      }
    },

    close: () => {
      return writeApi
        .close()
        .then(() => {
          console.info("Flushing Influx DB");
        })
        .catch((e) => {
          console.error("failure to close influx db", e);
        });
    },
  };
};

export default InfluxDbConnector;
