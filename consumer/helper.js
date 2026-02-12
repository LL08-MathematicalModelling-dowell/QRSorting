import Datacubeservices from "./datacube.services.js"; 

const datacube = new Datacubeservices(process.env.DATACUBE_API_KEY);


const saveOrderDetails = async (data) => {
    
    delete data.dataType
    data.orderId = (data.orderId).toLowerCase();
    console.log("ORDER ID:", data.orderId);

    const dbID = process.env.MASTER_DATABASE_ID
    const orderId = data.orderId
    const collId = orderId.slice(-4)
    console.log(`DATABASE ID is:${dbID}, collId is: ${collId}`);
    const response = await datacube.dataInsertion(dbID, collId, data);
    if (response.success) {
        console.log('Order Details inserted successfully in datacube:', response);
        return response 
    } else {
        console.error('Error inserting data:', response.error);
        return response
    }
}

function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

const saveScans = async (data) => {
    
    delete data.dataType

    const dbID = process.env.SCAN_DATABASE_ID
    const datetime = new Date(data.scannedAt)
    const collId = formatDate(datetime)
    console.log(`Datetime: ${datetime}`);
    console.log(`DATABASE ID is:${dbID}, collId is: ${collId}`);
    const response = await datacube.dataInsertion(dbID, collId, data);
    if (response.success) {
        console.log('Scan inserted successfully in datacube:', response);
        return response 
    } else {
        console.error('Error inserting scanneddata:', response.error);
        return response
    }
}

const saveMerchantDetails = async (data) => {
    
    delete data.dataType

    const dbID = process.env.MASTER_DATABASE_ID
    
    const response = await datacube.dataInsertion(process.env.MASTER_DATABASE_ID, process.env.MERCHANT_COLL, data);
    if (response.success) {
        console.log('Merchant Details inserted successfully in datacube:', response);
        return response 
    } else {
        console.error('Error inserting data:', response.error);
        return response
    }
}

export { saveOrderDetails, saveScans, saveMerchantDetails };