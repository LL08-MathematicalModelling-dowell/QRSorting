import Datacubeservices from "./datacube.services.js"; 

const datacube = new Datacubeservices(process.env.DATACUBE_API_KEY);


const saveOrderDetails = async (data) => {
    
    delete data.dataType

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

export { saveOrderDetails };