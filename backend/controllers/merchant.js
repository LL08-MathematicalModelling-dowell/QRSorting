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
    const domainName = req.body.domainName;
    const orderId = req.body.orderId;
    const databaseId = orderId.slice(-4);

    const qrGenerator = new QRCodeGenerator({
        baseUrl: `${domainName}/studentFeeback/`,
        orderId
      });

    const dataUrl = await qrGenerator.createGeneralQR();

    const qrResult = qrGenerator.dataUrlToBuffer(dataUrl);
    const buffer = qrResult.buffer;
    const contentType = qrResult.contentType;

    const url = qrGenerator.getUrl();

    let payload = {
        orderId: req.body.orderId,
        description: req.body.description,
        location: req.body.location,
        createdAt: new Date().toISOString(),
        qrCode : {
          link: url,
          image: buffer,
          contentType: contentType
        },
        dataType: "newOrder",
    };
    console.log("This is the topic:",process.env.KAFKA_TOPIC)
    try {
            await sendtoKafka(payload);
        res.set({
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="order-${orderId}-qr.png"`,
        });

        res.status(201).send(buffer);
        // res.status(200).json({ success: true, count: payload.length});
    } catch (err) {
        console.error("❌ Failed to send order to Kafka", err);
        res.status(500).json({ error: "Failed to order" });
    }
}