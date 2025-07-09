import express from "express";
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

const sitelistRouter = express.Router();

sitelistRouter.post('/load_site_list', async (req, res, next) => {

    console.log('여기는 안들어오는거얌?');

    console.log('chk');

    const { mainLocation, searchVal } = req.body
    console.log(mainLocation);

    console.log(searchVal);





    let locationQueryStr = ""
    if (mainLocation && mainLocation != '전국') {
        const locationList = mainLocation.split('/')
        for (let i = 0; i < locationList.length; i++) {
            const str = locationList[i];
            if (i == 0) {
                locationQueryStr = locationQueryStr + ` AND (location LIKE '%${str}%'`
            } else {
                locationQueryStr = locationQueryStr + ` OR location LIKE '%${str}%'`
            }
        }
        locationQueryStr = locationQueryStr + ')'
    }


    let searchQueryStr = ""
    if (searchVal) {
        searchQueryStr = ` AND subject LIKE '%${searchVal}%'`

    }


    let premium_list = [];
    let top_list = [];
    let site_list = [];

    const rows = "idx,location,thumbnail,imgs,subject,point,fee_type,fee,business,occupation,icons"
    try {
        const getPremiumListQuery = `SELECT ${rows} FROM site WHERE product = ? ${locationQueryStr} ${searchQueryStr} ORDER BY idx DESC`

        console.log(getPremiumListQuery);
        

        const [getPremiumList] = await sql_con.promise().query(getPremiumListQuery, ['premium']);
        premium_list = getPremiumList



        const getTopListQuery = `SELECT ${rows} FROM site WHERE product = ? ${locationQueryStr} ${searchQueryStr} ORDER BY idx DESC`
        const [getTopList] = await sql_con.promise().query(getTopListQuery, ['top']);
        top_list = getTopList

        const getSiteListQuery = `SELECT ${rows} FROM site WHERE (product = ? OR product IS NULL OR product = '') ${locationQueryStr} ${searchQueryStr} ORDER BY idx DESC`
        const [getSiteList] = await sql_con.promise().query(getSiteListQuery, ['free']);
        site_list = getSiteList
    } catch (error) {
        console.error(error.message);

    }

    res.json({ premium_list, top_list, site_list })
})

export { sitelistRouter }