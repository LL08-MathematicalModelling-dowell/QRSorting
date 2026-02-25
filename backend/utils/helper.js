import Datacubeservices from "../services/datacubeServices.js";
import crypto from "crypto";

const datacube = new Datacubeservices(process.env.DATACUBE_API_KEY);

function generateDates(year, month = null) {
  const dates = [];

  // Helper to format date as DD-MM-YYYY
  function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // If month is provided (1–12)
  if (month !== null) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(formatDate(d));
    }
  } 
  // If only year is provided
  else {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(formatDate(d));
    }
  }

  return dates;
}

const createFinancialYear = async (year) => {
    console.log("This is the data (helper.js):", year);
    const collections = []

    const fields = [
                
        {
          "name": "orderId",
          "type": "string"
        },
        {
		  "name": "status",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "scannedAt",
          "type": "string"
        }
            ]
    // const collectionNames = generateDates(new Date().getFullYear(), new Date().getMonth() + 1); 
    const collectionNames = generateDates(year);
    // console.log("This is the collection names:", collectionNames);
    
    for (let i = 0; i < collectionNames.length; i++) {
        // console.log(`Adding collection ${i} of ${collectionNames.length} to list`);
        collections.push({
            name: collectionNames[i],
            fields: fields
        })
    }
    // console.log("This is the collections:", collections);

    const response = await datacube.createCollection(process.env.SCAN_DATABASE_ID, collections);
    console.log("RESPONSE FOR FY CREATION:", response);
}

const formatDate = function(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

const decryptPayload = function(token) {
  console.log("Received token:", token);
  if (!process.env.QR_ENCRYPTION_KEY) {
    throw new Error("QR_ENCRYPTION_KEY missing");
  }

  const key = Buffer.from(process.env.QR_ENCRYPTION_KEY.trim(), "hex");

  if (key.length !== 32) {
    throw new Error("Invalid encryption key length");
  }

  const buffer = Buffer.from(token, "base64url");

  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const ALGO = "aes-256-gcm";

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

export { createFinancialYear, formatDate, decryptPayload };