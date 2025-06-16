import express from "express";
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

const sitelistRouter = express.Router();

sitelistRouter.post('/load_site_list', async (req, res, next) => {
    console.log('chk');

    const { mainLocation } = req.body
    console.log(mainLocation);
    


    let premium_list = [];
    let top_list = [];
    let site_list = [];

    const rows = "idx, thumbnail,imgs,subject,point,fee_type,fee,business,occupation"
    try {
        const getPremiumListQuery = `SELECT ${rows} FROM site WHERE product = ? ORDER BY idx DESC`
        const [getPremiumList] = await sql_con.promise().query(getPremiumListQuery, ['premium']);
        premium_list = getPremiumList

        const getTopListQuery = `SELECT ${rows} FROM site WHERE product = ? ORDER BY idx DESC`
        const [getTopList] = await sql_con.promise().query(getTopListQuery, ['top']);
        top_list = getTopList

        const getSiteListQuery = `SELECT ${rows} FROM site WHERE (product = ? OR product IS NULL OR product = '') ORDER BY idx DESC`
        const [getSiteList] = await sql_con.promise().query(getSiteListQuery, ['free']);
        site_list = getSiteList
    } catch (error) {

    }

    res.json({ premium_list, top_list, site_list })
})

export { sitelistRouter }