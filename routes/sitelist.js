import express from "express";
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

const sitelistRouter = express.Router();




// 관심 메뉴 사이트 리스트!!


sitelistRouter.post('/get_interest_list', async (req, res, next) => {
    console.log('gkgkgkgkgkg');

    const { userId, type } = req.body;
    let interestStatus = false;
    let statusMessage = ""
    let postList = [];

    try {
        if (type == 'interest') {
            const getUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
            const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [userId]);
            console.log(getUserInfo[0]['interest']);

            // 관심 분야 설정 안되어 있으면 return 처리!
            if (!getUserInfo[0]['interest']) {
                return res.json({ postList, interestStatus, statusMessage: "설정된 관심 지역이 없습니다.\n관심 지역 설정은 마이 페이지에서 설정 가능합니다." })
            }
            const interestInfo = JSON.parse(getUserInfo[0]['interest'])
            const whereClauses = Object.entries(interestInfo)
                .map(([field, values]) => {
                    if (!Array.isArray(values) || values.length === 0) return ''; // 배열이 비어있으면 제외
                    const clause = buildLikeClause(field, values);
                    return clause ? `(${clause})` : '';
                })
                .filter(clause => clause !== '') // 빈 문자열 제거
                .join(' AND ');

            const getInterestListQuery = `SELECT * FROM site WHERE ${whereClauses} ORDER BY idx DESC;`;
            const [getInterestList] = await sql_con.promise().query(getInterestListQuery);

            // 검색 결과값 없으면 false 리턴
            if (getInterestList.length == 0) {
                return res.json({ postList, interestStatus, statusMessage: "설정하신 조건에 대해\n검색된 결과가 없습니다." })
            }

            // 정상 처리~
            interestStatus = true
            postList = getInterestList

        } else if (type == 'zzim') {

        }

    } catch (error) {
        interestStatus = false
        console.error(error.message);

    }


    return res.json({ postList, interestStatus, statusMessage })
})


// 위에서만 쓰는 함수임!
function buildLikeClause(field, keywords) {
    return keywords.map(k => `${field} LIKE '%${k}%'`).join(' OR ');
}

// 메인 페이지 사이트 리스트!!!
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