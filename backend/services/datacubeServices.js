import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
class Datacubeservices {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://datacube.uxlivinglab.online/api';
        // this.baseUrl = 'https://www.dowelldatacube.uxlivinglab.online/db_api';
        this.headers = {
            Authorization: `Api-Key ${apiKey}`,
            // "Authorization": `Api-Key ${apiKey}`,
            ContentType: "application/json"
            // "Content-Type": "application/json"
        }
    }

    async dbCreation(dbName, collections) {
        const url = `${this.baseUrl}/create_database`;

        const payload = {
            db_name: dbName,
            collections: collections
        };
        try {
            const response = await axios.post(url, payload, { headers: this.headers });
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
            data: [data]
        };
        try {
            const response = await axios.post(url, payload, { headers: this.headers });
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
            const response = await axios.get(url, { headers: this.headers });
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
            const response = await axios.put(url, payload, { headers: this.headers });
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
        //     {
        // "collections": [{
        //     "name":"LatIndex",
        // "fields":[ {"name":"latitude","type":"number"}, {"name":"longitude","type":"number"}]
        // }]
        //   }
        const payload = {
            database_id: databaseId,
            collections: collections
        };
        try {
            const response = await axios.post(url, payload, { headers: this.headers });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: "Error retrieving collections",
                error: error.message
            };
        }
    }


    async collectionRetrieval(databaseId) {
        const url = `${this.baseUrl}/list_collections/?database_id=${databaseId}`;

        try {
            const response = await axios.get(url, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.log(error);
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

    async fileUpload(file, fileName) {
        try {
            console.log("Inisde file upload services")

            const url = `${this.baseUrl}/files/`
            const form = new FormData()

            form.append("file", fs.createReadStream(file));
            form.append("filename", fileName);
            const headers = {
                ...this.headers,
                ...form.getHeaders()
            }


            const response = await axios.post(url, form, { headers });

            console.log("Upload Response:", response.data);
            return response.data
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
        }
    }

    async fileDownload() {
        try {
            const url = `${this.baseUrl}/files/?page=1&page_size=10&search=report`;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return response.data;
        } catch (error) {
            console.error("Download Error:", error.response?.data || error.message);
        }
    }
}

export default Datacubeservices;