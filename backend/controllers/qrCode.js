import kafka from '../services/kafkaService.js';
// import Datacubeservices from '../services/datacubeServices.js';
import { v4 as uuidv4 } from "uuid";
// import { sendtoKafka } from '../utils/kafkaUtil.js'
import { getSchoolInfo } from '../utils/dbUtils.js';
import QRCodeGenerator from '../services/qrcodeService.js';
import { timeStamp } from 'console';

async function sendtoKafka(data) {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
            topic: process.env.KAFKA_TOPIC,
            messages: [{
                "key": uuidv4(),
                "value": JSON.stringify(data)
            }],
               
        });

}
export async function generateQRCode(req, res) {
  try {
    let qrGenerator, dataUrl, buffer, contentType, url, qrDoc;
   
    const schoolId = req.body.schoolId;
    const databaseId = req.body.databaseId;
    const domainName = req.body.domainName;

    if (req.body.studentId) {
      const studentId = req.body.studentId;
      qrGenerator = new QRCodeGenerator({
        baseUrl: `${domainName}/studentFeeback/`,
        schoolId,
        databaseId,
        studentId
      });

      dataUrl = await qrGenerator.createStudentQR(studentId);

      const qrResult = qrGenerator.dataUrlToBuffer(dataUrl);
      buffer = qrResult.buffer;
      contentType = qrResult.contentType;

      url = qrGenerator.getUrl();

      qrDoc = {
        Id: schoolId,
        databaseId: databaseId,
        studentId: studentId,
        qrCode : {
          link: url,
          image: buffer,
          contentType: contentType
        },
        createdAt: new Date().toISOString(),
        dataType: "newQRCode"
      };
    } else {
      qrGenerator = new QRCodeGenerator({
        baseUrl: `${domainName}/orderDetails/`,
        schoolId,
        databaseId
      });

      dataUrl = await qrGenerator.createGeneralQR();

      const qrResult = qrGenerator.dataUrlToBuffer(dataUrl);
      buffer = qrResult.buffer;
      contentType = qrResult.contentType;

      url = qrGenerator.getUrl();

      qrDoc = {
        databaseId: databaseId,
        schoolId: schoolId,
        qrCode : {
          link: url,
          image: buffer,
          contentType: contentType
        },
        createdAt: new Date().toISOString(),
        dataType: "newQRCode"
      };
    }

    sendtoKafka(qrDoc);
    console.log(`content type: ${contentType}, buffer: ${buffer}`);
    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="school-${schoolId}-qr.png"`,
    });

    res.status(201).send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};