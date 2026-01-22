import kafka from '../services/kafkaService.js';
import Datacubeservices from '../services/datacubeServices.js';
import { v4 as uuidv4 } from "uuid";
import { formatDate } from '../utils/helper.js';

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

export async function createScan(req, res) {
    const data = {
        ...req.body,
        dataType: "newScan"
    };
    sendtoKafka(data);
    console.log("This is the data:", data)
    res.status(200).json({ success: true, message: "Scan successfully sent to consumer" });
}

export async function getScansForDate(req, res) {
    
    try {
        const orderId = req.query.orderId;
        const datetime = new Date(req.query.date)
        const collId = formatDate(datetime)
        const filters = {"orderId": orderId};
        console.log("Filters:", filters);
        const results = await datacube.dataRetrieval(process.env.SCAN_DATABASE_ID, collId, JSON.stringify(filters));
        if (results.success){
            res.status(200).json({ success: true, message: "Retrieved scanned data successfully", scanDetails: results.data});
        }else {
            console.error("❌ Failed to get scanned data: 404");
            res.status(404).json({ success: false, message: "OrderId not found" });
        }
        
    } catch (err) {
        console.error("❌ Failed to get scanned data:", err);
        res.status(500).json({ error: "Failed to get scanned data" });
    }
}

//to do: get all scans for a day