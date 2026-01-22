import { Kafka } from 'kafkajs';
// import 'dotenv/config';
/**
 * Centralized Kafka client configuration.
 * Reads broker address from environment variables.
 */
const kafka = new Kafka({
    clientId: 'qr-app',
    // docker-compose provides a single broker name, which we wrap in an array
    brokers: [process.env.KAFKA_BROKER],
    connectionTimeout: 3000,
    requestTimeout: 25000,
    retry: { retries: 5 }
});

export default kafka;