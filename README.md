# um.metrics

handle push of the metrics inside influxdb

## install

```
npm install
```

## run

environement:

- BUCKET_NAME: Influx bucket name
- INFLUXDB_URL: Influx server url
- BROKERS: Kafka servers, comma separated
- CONSUMER_GROUP: Kafka consumer group
- TOPIC: Kafka topic to consume to

```
node index.js
```
