import { createFinancialYear } from "../utils/helper.js";

export const createFinancialYearController = async (req, res) => {
    const year = req.body.year;
    const response = await createFinancialYear(year);
    res.status(201).json(response);
};