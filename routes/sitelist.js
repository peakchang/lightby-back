import express from "express";
import { sql_con } from "../back-lib/db.js";
import { getQueryStr } from "../back-lib/lib.js";
import axios from 'axios'
import qs from 'qs'

const sitelistRouter = express.Router();




// 관심 메뉴 사이트 리스트!!


sitelistRouter.post('/get_interest_list', async (req, res, next) => {

    const { userId, type } = req.body;
    let interestStatus = false;
    let statusMessage = ""
    let postList = [];

    try {
        if (type == 'interest') {
            const getUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
            const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [userId]);


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

            const getZzimListQuery = `SELECT site.*
            FROM post_likes
            JOIN site ON post_likes.post_id = site.idx
            WHERE post_likes.user_id = ?
            AND post_likes.is_liked = 1
            ORDER BY site.idx DESC;`


            const [getZzimList] = await sql_con.promise().query(getZzimListQuery, [userId]);
            if (getZzimList.length == 0) {
                interestStatus = false;
                statusMessage = '찜 한 공고가 없습니다.'
                return res.json({ postList, interestStatus, statusMessage })
            }

            interestStatus = true;
            postList = getZzimList
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

    const { mainLocation, searchVal, sortVal } = req.body


    // let loadSiteList = [];
    // let currentStatus = ""
    // let setNextStatus = ""
    // let nextStartNum = 0

    console.log(sortVal);




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

    let sortQueryStr = ""
    if (sortVal) {
        if (sortVal == "high_fee") {
            sortQueryStr = "ORDER BY fee DESC, idx DESC";
        } else if (sortVal == "latest" || sortVal == "base") {
            sortQueryStr = "ORDER BY idx DESC";
        } else if (sortVal == "popular") {
            sortQueryStr = "ORDER BY view_count DESC, idx DESC";
        }
    }

    let adFilterQueryStr = ` AND created_at >= DATE_SUB(DATE(NOW()), INTERVAL 10 DAY)`
    // if (siteLoadStatus != 'free') {
    //     addFilterQueryStr = ` AND created_at >= DATE_SUB(DATE(NOW()), INTERVAL 10 DAY)`
    // }



    let premiumList = [];
    let topList = [];
    let freeList = [];

    const rows = "idx,location,thumbnail,imgs,subject,point,fee_type,fee,business,occupation,icons"
    try {

        const getPremiumListQuery = `SELECT ${rows} FROM site WHERE product = ? ${locationQueryStr}${searchQueryStr}${adFilterQueryStr} ${sortQueryStr}`
        const [getPremiumList] = await sql_con.promise().query(getPremiumListQuery, ['premium']);

        premiumList = getPremiumList


        const getTopListQuery = `SELECT ${rows} FROM site WHERE product = ? ${locationQueryStr}${searchQueryStr}${adFilterQueryStr} ${sortQueryStr}`
        const [getTopList] = await sql_con.promise().query(getTopListQuery, ['top']);

        topList = getTopList


        const getFreeListQuery = `SELECT ${rows} FROM site WHERE (product = ? OR product IS NULL OR product = '') ${locationQueryStr} ${searchQueryStr} ${sortQueryStr}`
        const [getFreeList] = await sql_con.promise().query(getFreeListQuery, ['free']);

        freeList = getFreeList




        // 프리미엄 / 탑 / 프리 순서로 뽑는거, 추후 스크롤 내릴때 적용 시키기!!!
        // const productPriority = ['premium', 'top', 'free'];

        // const getQuery = (product) => {
        //     if (product === 'free') {
        //         nextStartNum = freeStartNum + 10

        //         return `SELECT ${rows} FROM site 
        //         WHERE (product = ? OR product IS NULL OR product = '') 
        //         ${locationQueryStr} ${searchQueryStr} ORDER BY idx DESC LIMIT ${freeStartNum}, 10`;

        //     } else {
        //         return `SELECT ${rows} FROM site 
        //         WHERE product = ? 
        //         ${locationQueryStr}${searchQueryStr}${addFilterQueryStr} 
        //         ORDER BY idx DESC`;
        //     }
        // };

        // let currentIndex = productPriority.indexOf(siteLoadStatus);
        // let loadFound = false;

        // while (currentIndex < productPriority.length && !loadFound) {
        //     const currentProduct = productPriority[currentIndex];
        //     currentStatus = currentProduct

        //     const [result] = await sql_con.promise().query(getQuery(currentProduct), [currentProduct]);

        //     if (result.length > 0) {
        //         loadSiteList = result;
        //         setNextStatus = productPriority[Math.min(currentIndex + 1, productPriority.length - 1)];
        //         loadFound = true;
        //     } else {
        //         currentIndex++;
        //     }
        // }

        // // fallback: 아무것도 없으면 free로 한 번 더 시도
        // if (!loadFound) {
        //     const [fallback] = await sql_con.promise().query(getQuery('free'), ['free']);
        //     loadSiteList = fallback;
        //     setNextStatus = 'free';
        // }



    } catch (error) {
        console.error(error.message);

    }

    res.json({ premiumList, topList, freeList })
})

export { sitelistRouter }