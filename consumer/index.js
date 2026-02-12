import kafka from './kafka-client.js';
import 'dotenv/config';
import Datacubeservices from './datacube.services.js';
import { v4 as uuidv4 } from 'uuid';
import { saveOrderDetails, saveScans, saveMerchantDetails } from './helper.js';

// Environment variables from Docker Compose
const topic = process.env.KAFKA_TOPIC;
const groupId = process.env.KAFKA_GROUP_ID;
const consumer = kafka.consumer({ groupId: groupId });
const datacube = new Datacubeservices(process.env.DATACUBE_API_KEY);

/**
 * Main function to run the consumer worker.
 */
const run = async () => {
    // Connect and subscribe the Kafka consumer
    await consumer.connect();
    console.log('Kafka Consumer connected.');
    console.log("KAFKA_TOPIC;", process.env.KAFKA_TOPIC);
    await consumer.subscribe({ topic: topic, fromBeginning: false });
    console.log(`Subscribed to Kafka topic: ${topic} with group ID: ${groupId}`);

    // Start consuming messages
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                
                console.log(`Received message from partition ${partition}:`, data);
                if (data.dataType == 'newOrder') {
                    const res = await saveOrderDetails(data);
                    console.log("This is order creation block", res);
                    
                }
                else if (data.dataType == 'newScan') {
                    const res = await saveScans(data);
                    console.log("This is scan creation block", res);
                }
                else if (data.dataType == 'newMerchant') {
                    const res = await saveMerchantDetails(data);
                    console.log("This is merchant registration block", res);
                }

            } catch (err) {
                console.error('Error processing message:', err);
            }
        },
    });
};

run().catch(async (error) => {
    console.error('An error occurred in the consumer worker:', error);
    await shutdown();
    process.exit(1);
});

// Graceful shutdown logic
const shutdown = async () => {
    console.log('Shutting down consumer worker...');
    try {
        await consumer.disconnect();
        console.log('Kafka Consumer disconnected.');
    } catch (e) {
        console.error('Error disconnecting Kafka consumer', e);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
