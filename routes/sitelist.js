import express from "express";
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

const sitelistRouter = express.Router();

sitelistRouter.post('/load_site_list', async (req, res, next) => {
    console.log('chk');

    let site_list = [];

    const rows = "idx, thumbnail,imgs,subject,point,fee_type,fee,business,occupation"
    try {
        const getSiteListQuery = `SELECT ${rows} FROM site ORDER BY idx DESC`
        const [getSiteList] = await sql_con.promise().query(getSiteListQuery);
        site_list = getSiteList
    } catch (error) {

    }

    res.json({ site_list })
})

export { sitelistRouter }