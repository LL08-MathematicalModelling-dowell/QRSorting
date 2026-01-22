import axios from 'axios';

class Datacubeservices {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://datacube.uxlivinglab.online/api';
        // this.baseUrl = 'https://www.dowelldatacube.uxlivinglab.online/db_api';
        this.headers = {
        Authorization: `Api-Key ${apiKey}`,
        ContentType: "application/json"
        }
    }

    async dbCreation(dbName, collections) {
        const url = `${this.baseUrl}/create_database`;
        
        const payload = {
            db_name: dbName,
            collections: collections
        };
        try {
            const response = await axios.post(url, payload,{headers: this.headers});
            return response.data;
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: "Error creating Database",
                error: error.message
            };
        }
    }


    async dataInsertion(databaseId, collectionName, data) {
        const url = `${this.baseUrl}/crud/`;
        
        const payload = {
            database_id: databaseId,
            collection_name: collectionName,
            documents: [data]
        };
        try {
            const response = await axios.post(url, payload,{headers: this.headers});
            return response.data;
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: "Error inserting data",
                error: error.message
            };
        }
    }

    async dataRetrieval(databaseId, collectionName, filters) {
        const url = `${this.baseUrl}/crud/?database_id=${databaseId}&collection_name=${collectionName}&filters=${filters}`;
        
        try {
            const response = await axios.get(url,{headers: this.headers});
            return response.data;
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: "Error retrieving data",
                error: error.message
            };
        }
    }

    async dataUpdate(databaseId, collectionName, filters, updateData) {
        const url = `${this.baseUrl}/crud/`;
        
        const payload = {
            database_id: databaseId,
            collection_name: collectionName,
            filters: filters,
            update_data: updateData
        };
        try {
            const response = await axios.put(url, payload, {headers: this.headers});
            return {
                success: true,
                message: "Data updated successfully",
                response: response.data
            }
        } catch (error) {
            return {
                success: false,
                message: "Error updating data",
                error: error.message
            };
        }
    }

    async createCollection(databaseId, collections) {
        const url = `${this.baseUrl}/add_collection/`;
        const payload = {
            database_id: databaseId,
            collections: collections
        };
        try {
            const response = await axios.post(url, payload, {headers: this.headers});
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "Error retrieving collections",
                error: error.message
            };
        }
    }

    async collectionRetrieval(databaseName) {
        const url = `${this.baseUrl}/collections/`;
        const payload = {
            api_key: this.apiKey,
            db_name: databaseName,
            payment: false
        };
    
        try {
            const response = await axios({
                method: 'get',
                url: url,
                data: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "Error retrieving collections",
                error: error.message
            };
        }
    }
    

    async dataDelete(databaseName, collectionName, query) {
        const url = `${this.baseUrl}/crud/`;
        const payload = {
            api_key: this.apiKey,
            db_name: databaseName,
            coll_name: collectionName,
            operation: 'delete',
            query: query
        };
        try {
            const response = await axios.delete(url, { data: payload });
            return response.data;
        } catch (error) {
            console.error('Error in dataDelete:', error);
        }
    }
}

export default Datacubeservices;