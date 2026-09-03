import Datacubeservices from '../services/datacubeServices.js';

const datacube = new Datacubeservices(process.env.VITE_DATACUBE_API_KEY);
const feedbackDatabase = new Datacubeservices(process.env.FEEDBACK_API_KEY);

export async function getFeedbacksByDate(req, res) {

    try {
        console.log("This is the query:", req.query)
        const qrId = req.query.qrId.toLowerCase();
        const date = req.query.date;
        // const clientName = req.query.clientName.toLowerCase();
        const collId = qrId.slice(-4)
        const filters = {"type": "feedback", "submitted_at": {"$gte": date + "T00:00:00.000Z", "$lte": date + "T23:59:59.999Z"}};
        console.log("Filters:", filters);
        const results = await datacube.dataRetrieval(process.env.MASTER_DATABASE_ID, collId, JSON.stringify(filters));
        console.log(results)
        if (results.success && results.data.length > 0) {
            
            res.status(200).json({ success: true, message: "Retrieved feedback data successfully", feedbacks: results.data });
        } else {
            console.error("❌ Failed to get feedback data: 404");
            res.status(404).json({ success: false, message: "Feedback not found" });
        }

    } catch (err) {
        console.error("❌ Failed to get feedback data:", err);
        res.status(500).json({ error: "Failed to get feedback data" });
    }
}

export async function getQRCodeDetails(req, res) {

    try {
        console.log("This is the query:", req.query)
        const clientName = req.query.clientName.toLowerCase();
        const filters = {};
        console.log("Filters:", filters);
        const results = await feedbackDatabase.dataRetrieval(process.env.FEEDBACK_QR_DATABASE_ID, clientName, JSON.stringify(filters));
        console.log(results)
        if (results.success && results.data.length > 0) {
            
            res.status(200).json({ success: true, message: "Retrieved QR code data successfully", QRCodeDetails: results.data });
        } else {
            console.error("❌ Failed to get QR code data: 404");
            res.status(404).json({ success: false, message: "QR code data not found" });
        }

    } catch (err) {
        console.error("❌ Failed to get QR code data:", err);
        res.status(500).json({ error: "Failed to get QR code data" });
    }
}