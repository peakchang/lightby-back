import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const detailRouter = express.Router();

detailRouter.post('/', async (req, res, next) => {

    const { idx } = req.body;
    console.log(idx);

    let detail = {}

    try {
        const getDetailQuery = "SELECT * FROM site WHERE idx = ?";
        const [getDetail] = await sql_con.promise().query(getDetailQuery, [idx]);
        detail = getDetail[0]
        console.log(detail);
        
    } catch (error) {

    }

    res.json({ detail })
})

export { detailRouter }