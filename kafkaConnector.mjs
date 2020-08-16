import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { Kafka } = require("kafkajs");

export default (BROKERS, CONSUMER_GROUP, TOPIC, metricConnector) => {
  console.log("Kafka Consumer::Creating client for ", BROKERS);
  const kafka = new Kafka({
    clientId: "um-app",
    brokers: BROKERS,
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
          const metric = JSON.parse(message.value.toString("utf8"));
          console.log("Kafka Consumer::Pushing metric", metric);
          metricConnector.push(
            metric.type,
            metric.name,
            metric.value,
            metric.tag,
            metric.tagValue
          );
        },
      });
    });

  return {
    close: () => {
      flush();
      consumer.disconnect();
      kafka.close();
    },
  };
};
