import kafka from './kafka-client.js';
import 'dotenv/config';
import Datacubeservices from './datacube.services.js';
import { v4 as uuidv4 } from 'uuid';
import { insertSchoolData, createScannerType, createScanner, createStudent, saveQRCode } from './helper.js';

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
                if (data.dataType == 'newSchoolData') {
                   const res = await insertSchoolData(data);
                   console.log("This is the school insertion response",res);
                    
                }else if (data.dataType == 'newScannerType') {
                    console.log("Inside the else statement")
                    let payload = {
                        scannerType: data.scannerType,
                        schoolId: data.schoolId
                    }
                    const res = await createScannerType(payload);
                    console.log("This is the scanner insertion response",res);
                }else if (data.dataType == 'newScanner') {
                    console.log("Inside the 2nd else statement")
                    delete data.dataType
                  
                    const res = await createScanner(data);
                    console.log("This is the scanner insertion response",res);
                }else if (data.dataType == 'newStudent') {
                    console.log("Inside the 3rd else statement")
                    const res = await createStudent(data);
                    console.log("This is the student creation response",res);
                }
                else if (data.dataType == 'newQRCode') {
                    console.log("Inside the 4th else statement")
                    
                    const res = await saveQRCode(data);
                    console.log("This is the QR link:",data.qrCode);
                    
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
