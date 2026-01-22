import QRCodeGenerator from '../services/new_qrcode_service.js';

export async function generateQRCode(req, res) {
  try {
    let dataUrl, buffer, contentType, url, qrDoc;
   
    const link = req.body.link;

    const qrGenerator = new QRCodeGenerator({
        baseUrl: link
      });

      dataUrl = await qrGenerator.createGeneralQR();

      const qrResult = qrGenerator.dataUrlToBuffer(dataUrl);
      buffer = qrResult.buffer;
      contentType = qrResult.contentType;

      url = qrGenerator.getUrl();

      qrDoc = {
        link: url,
        image: buffer,
        contentType: contentType
      };

    console.log(`content type: ${contentType}, buffer: ${buffer}`);
    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="order-qr-code.png"`,
    });

    res.status(201).send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateCustomQR = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const baseUrl = req.body.link
    const color = req.body.color ? req.body.color : "#000000";
    const backgroundColor = req.body.backgroundColor ? req.body.backgroundColor : "#ffffff";
    const logo = req.file ? req.file.buffer : null;

    console.log("LINK:", baseUrl);

    const qr = new QRCodeGenerator({
      baseUrl,
      qrOptions: {
        color,
        backgroundColor,
        logo, // 👈 optional uploaded image
      },
    });

    const qrDataUrl = await qr.createGeneralQR();

    const { buffer, contentType } = qr.dataUrlToBuffer(qrDataUrl);

    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename=\"qrcode.png\"`,
    });

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};