import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";
import moment from "moment-timezone";
import aligoapi from "aligoapi"
import { getRandomBetween } from '../back-lib/lib.js';

// import cookieParser from "cookie-parser";

const apiRouter = express.Router();


apiRouter.get('/update_app_count', async (req, res, next) => {
    const today = moment().format('YYYY-MM-DD')
    try {
        const chkTodayCountQuery = "SELECT * FROM today_count WHERE date = ?"
        const [chkTodayCount] = await sql_con.promise().query(chkTodayCountQuery, [today]);

        if (chkTodayCount.length > 0) {
            const updateTodayCountQuery = "UPDATE today_count SET app_all_count = ? WHERE date = ?";
            await sql_con.promise().query(updateTodayCountQuery, [chkTodayCount[0]['app_all_count'] + 1, today]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.status(200).json({})
})



apiRouter.get('/insert_n_update_app_count', async (req, res, next) => {

    const today = moment().format('YYYY-MM-DD')
    try {
        const chkTodayCountQuery = "SELECT * FROM today_count WHERE date = ?"
        const [chkTodayCount] = await sql_con.promise().query(chkTodayCountQuery, [today]);

        if (chkTodayCount.length == 0) {
            const insertTodayCountQuery = "INSERT INTO today_count (date, app_count, app_all_count) VALUES (?,?,?)";
            await sql_con.promise().query(insertTodayCountQuery, [today, 1, 1]);
        } else {
            const updateTodayCountQuery = "UPDATE today_count SET app_count = ?, app_all_count = ? WHERE date = ?";
            await sql_con.promise().query(updateTodayCountQuery, [chkTodayCount[0]['app_count'] + 1, chkTodayCount[0]['app_all_count'] + 1, today]);
        }
    } catch (err) {
        console.error(err.message);
    }

    res.status(200).json({})

})


apiRouter.get('/update_count', async (req, res, next) => {

    const today = moment().format('YYYY-MM-DD')
    const random = getRandomBetween(5, 8)
    try {
        const chkTodayCountQuery = "SELECT * FROM today_count WHERE date = ?"
        const [chkTodayCount] = await sql_con.promise().query(chkTodayCountQuery, [today]);

        if (chkTodayCount.length > 0) {
            const updateTodayCountQuery = "UPDATE today_count SET fake_count = ? WHERE date = ?";
            await sql_con.promise().query(updateTodayCountQuery, [chkTodayCount[0]['fake_count'] + random, today]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.status(200).json({})
})


apiRouter.post('/record_visit', async (req, res) => {

    console.log('방문 로그 진입!');

    // 1. 전달받은 헤더에서 정보를 먼저 찾고, 없으면 요청자 정보 사용
    const userAgent = req.body.clientUA || req.headers['user-agent'] || 'unknown';
    const ip = req.body.clientIp || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(ip);

    const { path, referer } = req.body; // 유입경로(referer)는 프론트에서 보내줌

    // 2. 봇 필터링 (생략 가능하지만 권장)
    const botKeywords = ['bot', 'spider', 'crawler', 'lighthouse'];
    const isBot = botKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));

    if (isBot) {
        return res.status(200).json({ skip: true, reason: 'bot or node' });
    }

    try {
        // 3. DB 입력 (user_agent 컬럼 포함)
        const query = "INSERT INTO visit_logs (ip, user_agent, path, referer) VALUES (?, ?, ?, ?)";
        await sql_con.promise().query(query, [ip, userAgent, path, referer]);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: 'DB 에러' });
    }
});

apiRouter.get('/visit_stats_all', async (req, res) => {

    console.log('스타트트트!!!');

    const { start, end } = req.query;

    try {
        // 1. 일자별 요약 통계 (그래프 및 상단 테이블용)
        const summaryQuery = `
            SELECT 
                visit_date as date,
                COUNT(DISTINCT ip) as total_count,
                COUNT(DISTINCT CASE WHEN platform = 'WEB' THEN ip END) as web_count,
                COUNT(DISTINCT CASE WHEN platform = 'APP' THEN ip END) as app_count
            FROM visit_logs 
            WHERE visit_date BETWEEN ? AND ?
            GROUP BY visit_date
            ORDER BY visit_date DESC
        `;

        // 2. 상세 로그 (하단 테이블용)
        const detailQuery = `
            SELECT created_at as date, ip, referer, user_agent, platform
            FROM visit_logs
            WHERE visit_date BETWEEN ? AND ?
            ORDER BY created_at DESC
            LIMIT 100
        `;

        const [summary] = await sql_con.promise().query(summaryQuery, [start, end]);
        const [details] = await sql_con.promise().query(detailQuery, [start, end]);

        res.status(200).json({ summary, details });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({ error: err.message });
    }
});



apiRouter.get('/insert_n_update_count', async (req, res, next) => {

    const today = moment().format('YYYY-MM-DD');
    const random = getRandomBetween(5, 8);

    try {
        // 1. 먼저 오늘 데이터가 있는지 확인
        const [rows] = await sql_con.promise().query(
            "SELECT idx, fake_count, real_count FROM today_count WHERE date = ?",
            [today]
        );

        if (rows.length === 0) {
            // 2. 데이터가 없으면 새로 삽입
            await sql_con.promise().query(
                "INSERT INTO today_count (date, fake_count, real_count) VALUES (?, ?, 1)",
                [today, random]
            );
            return res.status(200).json({ message: 'inserted' }); // 응답 후 종료
        } else {
            // 3. 데이터가 있으면 기존 값에 더하기 (계산은 SQL에서 직접 하는 게 가장 정확함)
            await sql_con.promise().query(
                "UPDATE today_count SET fake_count = fake_count + ?, real_count = real_count + 1 WHERE date = ?",
                [random, today]
            );
            return res.status(200).json({ message: 'updated' }); // 응답 후 종료
        }
    } catch (err) {
        console.error(err);
        // 에러 응답 시 헤더 중복 전송 방지
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
    }
})




// 인증번호 발송
apiRouter.post('/send_sms', async (req, res, next) => {

    const { phone, message } = req.body;

    try {
        const AuthData = {
            key: process.env.ALIGO_SMS_KEY,
            // 이곳에 발급받으신 api key를 입력하세요
            userid: process.env.ALIGO_USER_ID,
            // 이곳에 userid를 입력하세요
        }
        req.body = {
            sender: '010-3124-1105',
            receiver: phone, // 수신자 번호
            msg: message, // 문자 메시지 내용
            msg_type: 'SMS', // 메시지 타입 (SMS, LMS, MMS)
        }

        const result = await aligoapi.send(req, AuthData)

    } catch (err) {
        console.error(err.message);
    }

    res.status(200).json({})
})

// 게시물들 조회수 올리기!!
apiRouter.post('/raise_view_count', async (req, res, next) => {
    const { table, idx } = req.body

    try {
        const getSiteViewCountQuery = `SELECT view_count FROM ${table} WHERE idx = ?`;
        const [getSiteViewCount] = await sql_con.promise().query(getSiteViewCountQuery, [idx]);
        const resCount = Number(getSiteViewCount[0]['view_count']) + 1
        const updateViewCountQuery = `UPDATE ${table} SET view_count = ? WHERE idx = ?`;
        await sql_con.promise().query(updateViewCountQuery, [resCount, idx]);

    } catch (error) {

    }

    res.status(200).json({})
})

apiRouter.get('/load_main_count', async (req, res, next) => {

    let todayCount = 0;
    let newSiteCount = 0;
    let baseEnv = {}
    const today = moment().format('YYYY-MM-DD')
    try {
        const getTodayCountQuery = "SELECT fake_count FROM today_count WHERE date = ?";
        const [getTodayCount] = await sql_con.promise().query(getTodayCountQuery, [today]);

        if (getTodayCount.length > 0) {
            todayCount = getTodayCount[0]['fake_count']
        }

        const getJobPostCountQuery = "SELECT COUNT(*) AS site_count FROM site WHERE created_at >= DATE_SUB(DATE(NOW()), INTERVAL 7 DAY);"
        const [getJobPostCount] = await sql_con.promise().query(getJobPostCountQuery);

        newSiteCount = getJobPostCount[0]['site_count']

        // baseEnv 불러오기!
        const getBaseEnvQuery = "SELECT * FROM basic_env WHERE base = TRUE";
        const [getBaseEnv] = await sql_con.promise().query(getBaseEnvQuery);

        if (getBaseEnv.length > 0) {
            baseEnv = getBaseEnv[0]
        }

    } catch (error) {

    }

    res.json({ todayCount, newSiteCount, baseEnv })
})




apiRouter.post('/update_interest', async (req, res, next) => {
    const { idx, jsonStr } = req.body
    try {
        const updateInterestQuery = "UPDATE users SET interest = ? WHERE idx = ?";
        await sql_con.promise().query(updateInterestQuery, [jsonStr, idx]);
    } catch (error) {

    }

    res.json({})
})


// my 페이지 회원 정보 수정 부분
apiRouter.post('/update_user_info', async (req, res, next) => {

    const { idx, nickname, phone, type } = req.body;
    if (type == 'nickname') {
        try {
            const updateNicknameQuery = "UPDATE users SET nickname = ? WHERE idx = ?";
            await sql_con.promise().query(updateNicknameQuery, [nickname, idx]);

        } catch (error) {

        }
    } else if (type == 'phone') {
        const updatePhoneQuery = "UPDATE users SET phone = ? WHERE idx = ?";
        await sql_con.promise().query(updatePhoneQuery, [phone, idx]);
    }

    res.json({})
})


// 비밀변호 변경
apiRouter.post('/update_password', async (req, res, next) => {
    const { idx, prevPassword, password } = req.body;

    try {
        const loadUserInfo = "SELECT * FROM users WHERE idx = ?";
        const [user_info] = await sql_con.promise().query(loadUserInfo, [idx]);

        const isMatch = await bcrypt.compare(prevPassword, user_info[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: '기존 비밀번호가 일치하지 않습니다.' })
        }

        const saltRounds = 10; // 솔트 라운드 수 (높을수록 보안은 좋지만 속도가 느려짐)
        const newPassword = await bcrypt.hash(password, saltRounds);

        const updatePasswordQuery = "UPDATE users SET password = ? WHERE idx = ?";
        await sql_con.promise().query(updatePasswordQuery, [newPassword, idx]);

    } catch (error) {
        return res.status(400).json({ message: '에러 발생! 관리자에게 문의 주세요!' })
    }


    return res.json({})
})


apiRouter.post('/update_profile', async (req, res, next) => {
    const { type, idx, profile } = req.body;

    if (type == 'delete') {
        const storage = new Storage({
            projectId: process.env.GCS_PROJECT,
            keyFilename: process.env.GCS_KEY_FILE,
        });
        const bucketName = process.env.GCS_BUCKET_NAME;
        const bucket = storage.bucket(bucketName);
        try {
            await bucket.file(profile).delete()

            const getUserInfoQuery = "SELECT profile_image FROM users WHERE idx = ?";
            const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [idx]);

            return res.json({ profile: getUserInfo[0]['profile_image'] })
        } catch (error) {
            console.error(error.message);
            // return res.status(400).json({})
        }
    } else {
        try {

            const getUserInfoQuery = "SELECT profile_image FROM users WHERE idx = ?";
            const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [idx]);

            if (getUserInfo[0]['profile_image']) {
                const storage = new Storage({
                    projectId: process.env.GCS_PROJECT,
                    keyFilename: process.env.GCS_KEY_FILE,
                });
                const bucketName = process.env.GCS_BUCKET_NAME;
                const bucket = storage.bucket(bucketName);
                try {
                    await bucket.file(getUserInfo[0]['profile_image']).delete()
                } catch (error) {
                    console.error(error.message);
                }
            }


            const updateProfileQuery = "UPDATE users SET profile_image = ? WHERE idx = ?";
            await sql_con.promise().query(updateProfileQuery, [profile, idx]);
        } catch (error) {

        }
    }

    res.json({})


})

// my페이지 진입시 user_info 불러오는 부분 / 본인 글 갯수도 같이 부르기!
apiRouter.post('/load_user_info', async (req, res, next) => {
    const { userIdx } = req.body;
    let userInfo = {};
    let postCount = 0;
    try {
        const loadUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
        const [loadUserInfo] = await sql_con.promise().query(loadUserInfoQuery, [userIdx]);
        userInfo = loadUserInfo[0]
        const getSiteCountQuery = "SELECT COUNT(*) AS sitecount FROM site WHERE user_id = ?";
        const [getSiteCount] = await sql_con.promise().query(getSiteCountQuery, [userInfo.idx]);

        const getBoardFeeCountQuery = "SELECT COUNT(*) AS boardcount FROM board_fee WHERE user_id = ?";
        const [getBoardFeeCount] = await sql_con.promise().query(getBoardFeeCountQuery, [userInfo.idx]);
        postCount = getSiteCount[0]['sitecount'] + getBoardFeeCount[0]['boardcount']



    } catch (error) {

    }
    res.json({ userInfo, postCount })
})

apiRouter.post('/payment_customerkey_chk', async (req, res, next) => {
    const { userId } = req.body;

    let customer_key = ""
    let user_name = ""

    try {
        const getUserCustomerKeyQuery = "SELECT customer_key, name FROM users WHERE idx = ?";
        const [getUserCustomerKey] = await sql_con.promise().query(getUserCustomerKeyQuery, [userId]);
        user_name = getUserCustomerKey[0]['name']
        if (getUserCustomerKey[0]['customer_key']) {
            customer_key = getUserCustomerKey[0]['customer_key']

        } else {
            customer_key = `usr_${userId}_${Date.now().toString(36)}`;
            const updateUserCustomerKeyQuery = "UPDATE users SET customer_key = ? WHERE idx = ?";
            await sql_con.promise().query(updateUserCustomerKeyQuery, [customer_key, userId]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.json({ customer_key, user_name });
})

export { apiRouter }