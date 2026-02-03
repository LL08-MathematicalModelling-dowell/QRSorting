import kafka from '../services/kafkaService.js';
import Datacubeservices from '../services/datacubeServices.js';
import { v4 as uuidv4 } from "uuid";
import { timeStamp } from 'console';
import QRCodeGenerator from '../services/qrcodeService.js';

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

export async function createOrder(req, res) {
    console.log("This is the body:", req.body)

    let payload = {
        ...req.body,
        // audioFile: req.file ? req.file.buffer : null,
        localtime: new Date().toISOString(),
        dataType: "newOrder",
    };

    console.log("This is the topic:",process.env.KAFKA_TOPIC)
    try {
            await sendtoKafka(payload);
       
        res.status(201).json({ success: true, message: "Order created successfully" });
    } catch (err) {
        console.error("❌ Failed to send order to Kafka", err);
        res.status(500).json({ error: "Failed to order" });
    }
}

export async function getOrderDetails(req, res) {
    
    try {
        const orderId = req.query.orderId;
        const collId = orderId.slice(-4)
        const filters = {"orderId": orderId};
        console.log("Filters:", filters);
        const results = await datacube.dataRetrieval(process.env.MASTER_DATABASE_ID, collId, JSON.stringify(filters));
        console.log(results)
        if (results.success && results.data.length > 0){
            res.status(200).json({ success: true, message: "Retrieved order details successfully", orderDetails: results.data});
        }else {
            console.error("❌ Failed to get order details: 404");
            res.status(404).json({ success: false, message: "Order not found" });
        }
        
    } catch (err) {
        console.error("❌ Failed to get order details:", err);
        res.status(500).json({ error: "Failed to get order details" });
    }
}

// export async function getOrders(req, res) {
    
//     try {
//         const orderId = req.body.orderId;
//         const collId = orderId.slice(-4)
//         const filters = req.body.filters;

//         const results = await datacube.dataRetrieval(process.env.MASTER_DATABASE_ID, collId, filters);
//         if (results.success){
//             res.status(200).json({ success: true, message: "Retrieved scanner types successfully", orderDetails: results.data});
//         }else {
//             console.error("❌ Failed to get order details: 404");
//             res.status(404).json({ error: "Order not found" });
//         }
        
//     } catch (err) {
//         console.error("❌ Failed to get order details:", err);
//         res.status(500).json({ error: "Failed to get order details" });
//     }
// }

export async function updateOrderDetails(req, res) {
    
    try {
        const orderId = req.body.orderId;
        const collId = orderId.slice(-4)
        const filters = {"orderId": orderId};
        const updateData = req.body.updateData;

        const results = await datacube.dataUpdate(process.env.MASTER_DATABASE_ID, collId, filters, updateData);
        if (results.success){
            res.status(200).json({ success: true, message: "Order details updated successfully"});
        }else {
            console.error("❌ Failed to update order details: 404");
            res.status(404).json({ error: "Update failed" });
        }
        
    } catch (err) {
        console.error("❌ Failed to update order details:", err);
        res.status(500).json({ error: "Failed to update order details" });
    }
}