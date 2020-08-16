import InfluxDbConnector from "../influxDbConnector.mjs";

//Getting context
const DATABASE = process.env.DATABASE || "db0";
const INFLUX_USERNAME = process.env.USERNAME || "admin";
const INFLUX_PASSWORD = process.env.PASSWORD || "admin";
const INFLUX_URL = process.env.INFLUXDB_URL || "http://localhost:8086";

// Creation of the instances
try {
  const influxDbConnector = InfluxDbConnector(
    INFLUX_URL,
    DATABASE,
    INFLUX_USERNAME,
    INFLUX_PASSWORD
  );

  influxDbConnector.push("test", "random", Math.random(), "tag", 123);

  influxDbConnector.close();
} catch (e) {
  console.error(e);
}
