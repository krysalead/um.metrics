import InfluxDbConnector from "./influxDbConnector.mjs";
import KafkaConnector from "./kafkaConnector.mjs";

//Getting context
const CONSUMER_GROUP = process.env.CONSUMER_GROUP || "metric-group";
const TOPIC = process.env.TOPIC || "metric-topic";
const BROKERS = process.env.BROKERS
  ? process.env.BROKERS.split(",")
  : ["kafka:9092"];
const DATABASE = process.env.DATABASE || "functional";
const INFLUX_USERNAME = process.env.USERNAME || "admin";
const INFLUX_PASSWORD = process.env.PASSWORD || "admin";
const INFLUX_URL = process.env.INFLUXDB_URL;

// Creation of the instances
const influxDbConnector = InfluxDbConnector(
  INFLUX_URL,
  DATABASE,
  INFLUX_USERNAME,
  INFLUX_PASSWORD
);
// This one act as infinit loop
const kafkaConnector = KafkaConnector(
  BROKERS,
  CONSUMER_GROUP,
  TOPIC,
  influxDbConnector
);

// Clean up method
const quit = () => {
  kafkaConnector.close();
  influxDbConnector.close();
};

// listen to signal to finish properly
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  quit();
});
process.on("SIGINT", () => {
  console.info("SIGINT signal received.");
  quit();
});
