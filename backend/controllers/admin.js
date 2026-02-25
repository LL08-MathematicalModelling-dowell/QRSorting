import { createFinancialYear, decryptPayload } from "../utils/helper.js";
import kafka from '../services/kafkaService.js';
import Datacubeservices from '../services/datacubeServices.js';
import { v4 as uuidv4 } from "uuid";

const datacube = new Datacubeservices(process.env.DATACUBE_API_KEY);

async function sendtoKafka(data) {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
            topic: process.env.KAFKA_TOPIC,
            messages: [{
                "key": uuidv4(),
                // "value": JSON.stringify({"name":"Exhibitor1","scans":"scans"})
                "value": JSON.stringify(data)
            }],
               
        });

}


export const createFinancialYearController = async (req, res) => {
    const year = req.body.year;
    const response = await createFinancialYear(year);
    res.status(201).json(response);
};

export async function verifyMerchant(req, res) {
    
    try {
        console.log("This is the query:", req.query)
        const phone = req.query.phoneNumber;
        const filters = {"phoneNumber": phone};
        console.log("Filters:", filters);
        const results = await datacube.dataRetrieval(process.env.MASTER_DATABASE_ID, process.env.MERCHANT_COLL, JSON.stringify(filters));
        console.log(results)
        if (results.success && results.data.length > 0){
            res.status(200).json({ success: true, message: "Verification successful", merchantDetails: results.data});
        }else {
            console.error("❌ Failed to get merchant details: 404");
            res.status(404).json({ success: false, message: "Merchant not found" });
        }
        
    } catch (err) {
        console.error("❌ Failed to get merchant details:", err);
        res.status(500).json({ error: "Failed to get merchant details" });
    }
}

export async function registerMerchant(req, res) {
    console.log("This is the body:", req.body)

    let payload = {
        ...req.body,
        localtime: new Date().toISOString(),
        dataType: "newMerchant",
    };

    console.log("This is the topic:",process.env.KAFKA_TOPIC)
    try {
            await sendtoKafka(payload);
       
        res.status(201).json({ success: true, message: "Merchant registeration details sent successfully" });
    } catch (err) {
        console.error("❌ Failed to send merchant details to Kafka", err);
        res.status(500).json({ error: "Failed to register" });
    }
}

export async function decryptPayloadController(req, res) {
    const payload = req.body.payload;
    const decryptedPayload = await decryptPayload(payload);
    console.log("Decrypted Payload:", decryptedPayload);
    res.status(200).json({ success: true, message: "Payload decrypted successfully", payload: decryptedPayload });
}