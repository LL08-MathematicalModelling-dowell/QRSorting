import Datacubeservices from '../services/datacubeServices.js';

const datacube = new Datacubeservices(process.env.VITE_DATACUBE_API_KEY);

export async function getFeedbacks(req, res) {

    try {
        console.log("This is the query:", req.query)
        const qrId = req.query.qrId.toLowerCase();
        const collId = qrId.slice(-4)
        const filters = {"type": "feedback" };
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