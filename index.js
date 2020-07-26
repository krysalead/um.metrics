const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const { Kafka } = require("kafkajs");

// influx side

const isFloat = (possibleFloatValue) => {
  return !isNaN(parseFloat(possibleFloatValue));
};

let writeApi;
let counter = 0;
const BUCKET_NAME = process.env.BUCKET_NAME || "functional";

const influxInstance = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: null,
});
writeApi = influxInstance.getWriteApi("8e23967877953738", BUCKET_NAME);

const push = (type, name, value, tag, tagValue) => {
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
    writeApi.flush();
  }
};

const flush = () => {
  return writeApi
    .close()
    .then(() => {
      console.info("Flushing Influx DB");
    })
    .catch((e) => {
      console.error("failure to close influx db", e);
    });
};

////// Kafka side

const CONSUMER_GROUP = process.env.CONSUMER_GROUP || "metric-group";
const TOPIC = process.env.TOPIC || "metric-topic";

console.log("Kafka Consumer::Creating client for ", process.env.BROKERS);
const kafka = new Kafka({
  clientId: "um-app",
  brokers: process.env.BROKERS
    ? process.env.BROKERS.split(",")
    : ["kafka:9092"],
});

console.log("Kafka Consumer::Creating consumer ", [CONSUMER_GROUP, TOPIC]);

const consumer = kafka.consumer({ groupId: CONSUMER_GROUP });

consumer
  .connect()
  .then(() => {
    return consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  })
  .then(() => {
    return consumer.run({
      eachMessage: ({ topic, partition, message }) => {
        console.log("Kafka Consumer::Received message", [
          message,
          partition,
          topic,
        ]);
        const metric = message.value;
        console.log("Kafka Consumer::Pushing metric", metric);
        push(
          metric.type,
          metric.name,
          metric.value,
          metric.tag,
          metric.tagValue
        );
      },
    });
  });
