import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";
import moment from "moment-timezone";
import aligoapi from "aligoapi"
import { getQueryStr } from "../back-lib/lib.js";
import jwt from 'jsonwebtoken';

// import cookieParser from "cookie-parser";

const authRouter = express.Router();

authRouter.get('/kakao_app_callback', async (req, res, next) => {

    console.log('카카오 콜백 들어왔나?!?!?!?!?!?!');
    
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');

    if (!code) return res.status(400).send('no code');

    const appUrl = `myapp://oauth/kakao?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    // 일부 브라우저 302 커스텀스킴 차단 대비 JS 방식
    res.set('Content-Type', 'text/html; charset=utf-8').send(`
<!doctype html><meta charset="utf-8">
<title>앱으로 이동 중...</title>
<script>setTimeout(function(){ location.href='${appUrl}'; }, 50);</script>
앱으로 이동 중입니다... <a href="${appUrl}">안 되면 여길 눌러주세요</a>
`);
});

authRouter.post('/access_hook_chk_app', async (req, res, next) => {

    let userInfo = {}
    try {
        const authHeader = req.headers.authorization; // 또는 req.get('Authorization')
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        const userInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        return res.status(200).json({ userInfo })
    } catch (error) {
        console.error(error.message);

        return res.status(400)
    }

    res.json({})
})

authRouter.post('/refresh_hook_chk_app', async (req, res, next) => {

    let userInfo = {}
    try {
        const authHeader = req.headers.authorization; // 또는 req.get('Authorization')
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const getUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [payload.userId]);
        userInfo = getUserInfo[0]

        const newAccessToken = jwt.sign({ userId: userInfo.idx, rate: userInfo.rate }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        return res.status(200).json({ userInfo, newAccessToken })
    } catch (error) {
        return res.status(400)
    }
})


authRouter.post('/app_login', async (req, res, next) => {

    const { id, password } = req.body;

    let userInfo = {}
    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE id = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [id]);
        if (getUserInfo.length === 0) {
            return res.status(400).json({ message: '아이디가 존재하지 않습니다.' })
        }
        userInfo = getUserInfo[0]

        const isMatch = await bcrypt.compare(password, userInfo.password);

        // 비밀번호 인증 통과시
        if (isMatch) {

            const accessPayload = {
                userId: userInfo.idx,
                rate: userInfo.rate
            }

            const refreshPayload = {
                userId: userInfo.idx
            }

            // 토큰 생성
            const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '14d' });

            const now = moment().format('YYYY-MM-DD HH:mm:ss')

            // DB에 토큰 저장
            const refreshTokenUpdateQuery = `UPDATE users SET refresh_token = ?, connected_at = ? WHERE idx = ?`;
            await sql_con.promise().query(refreshTokenUpdateQuery, [refreshToken, now, userInfo.idx]);

            return res.json({ userInfo, accessToken, refreshToken })
        } else {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
        }
    } catch (error) {
        console.error(error.message);

        return res.status(400).json({ message: '에러가 발생 했습니다.' })
    }
})





authRouter.post('/logout', async (req, res, next) => {

    const { idx } = req.body;

    try {
        const deleteTokenQuery = "UPDATE users SET refresh_token = '' WHERE idx = ?";
        await sql_con.promise().query(deleteTokenQuery, [idx]);
    } catch (error) {

    }
    res.status(200).json({})
})




// 회원 가입시 아이디 / 닉네임 / 전화번호 중복 체크 부분
authRouter.post('/duplicate_chk', async (req, res, next) => {
    const body = req.body;
    try {
        const idCheckQuery = `SELECT * FROM users WHERE ${body.type} = ?`;
        const [idCheckRows] = await sql_con.promise().query(idCheckQuery, [body.value]);
        if (idCheckRows.length > 0) {
            return res.status(400).json({ message: '중복된 값이 있습니다.' })
        }

    } catch (error) {

    }

    return res.status(200).json({})
})

// 회원 가입 완료 부분
authRouter.post('/join', async (req, res, next) => {
    const body = req.body

    const saltRounds = 10; // 솔트 라운드 수 (높을수록 보안은 좋지만 속도가 느려짐)
    body.password = await bcrypt.hash(body.password, saltRounds);
    const queryStr = getQueryStr(body, 'insert');

    try {
        const insertUserQuery = `INSERT INTO users (${queryStr.str}) VALUES (${queryStr.question})`;
        const [testData] = await sql_con.promise().query(insertUserQuery, queryStr.values);
    } catch (error) {
        console.error(error.message);
    }

    return res.json({ testData: 'testData', gogoData: 'gogoData' })
})


// 로그인 부분
authRouter.post('/login', async (req, res, next) => {

    const body = req.body

    const { id, password } = req.body

    let userInfo = {}
    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE id = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [id]);

        if (getUserInfo.length === 0) {
            return res.status(400).json({ message: '아이디가 존재하지 않습니다.' })
        }

        userInfo = getUserInfo[0]
        const isMatch = await bcrypt.compare(password, getUserInfo[0].password);

        if (isMatch) {

            const accessPayload = {
                userId: userInfo.idx,
                rate: userInfo.rate
            }

            const refreshPayload = {
                userId: userInfo.idx
            }

            const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
            const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '14d' });

            const now = moment().format('YYYY-MM-DD HH:mm:ss')

            // 리프레쉬 토큰 / 마지막 접속 시간 업데이트
            const refreshTokenUpdateQuery = `UPDATE users SET refresh_token = ?, connected_at = ? WHERE idx = ?`;
            await sql_con.promise().query(refreshTokenUpdateQuery, [refreshToken, now, getUserInfo[0].idx]);


            res.cookie("access_token", accessToken, {
                httpOnly: true,   // JS 접근 불가 → XSS 방지
                secure: true,    // HTTPS에서만(운영은 true), 로컬개발은 false
                sameSite: "lax",  // 도메인 다를 때는 "none" + secure:true
                path: "/",        // 전체 경로에서 사용
                maxAge: 1000 * 5
            });


            res.cookie("refresh_token", accessToken, {
                httpOnly: true,   // JS 접근 불가 → XSS 방지
                secure: true,    // HTTPS에서만(운영은 true), 로컬개발은 false
                sameSite: "lax",  // 도메인 다를 때는 "none" + secure:true
                path: "/",        // 전체 경로에서 사용
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            });



        } else {
            return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
        }
    } catch (error) {
        console.error(error.message);
        return res.status(400).json({ message: '에러가 발생 했습니다. 다시 시도해주세요' })

    }
    return res.status(200).json({ userInfo })
})









authRouter.post('/login_idchk', async (req, res, next) => {

    const { id } = req.body;

    let userInfo = {}
    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE id = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [id]);
        if (getUserInfo.length === 0) {
            return res.status(400).json({ message: '아이디가 존재하지 않습니다.' })
        }
        userInfo = getUserInfo[0]
        return res.json({ userInfo })
    } catch (error) {
        return res.status(400).json({ message: '에러가 발생 했습니다.' })
    }
})

authRouter.post('/token_update', async (req, res, next) => {

    const { refreshToken, idx } = req.body;
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const refreshTokenUpdateQuery = `UPDATE users SET refresh_token = ?, connected_at = ? WHERE idx = ?`;
        await sql_con.promise().query(refreshTokenUpdateQuery, [refreshToken, now, idx]);
        return res.status(200).json({})
    } catch (error) {
        return res.status(400).json({ message: '에러가 발생 했습니다.' })
    }
})

authRouter.post('/access_hook_chk', async (req, res, next) => {

    const { accessToken } = req.body;
    try {
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        return res.status(200).json({ userId: payload.userId, rate: payload.rate })
    } catch (error) {
        console.error(error.message);
    }

    res.json({})
})

authRouter.post('/refresh_hook_chk', async (req, res, next) => {
    const { idx, refreshToken } = req.body;
    try {

        const getUserInfoQuery = "SELECT * FROM users WHERE idx = ? AND refresh_token = ?";
        const [userInfoRow] = await sql_con.promise().query(getUserInfoQuery, [idx, refreshToken]);

        if (userInfoRow.length > 0) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            const updateLastConnectQuery = "UPDATE users SET connected_at = ? WHERE idx = ?"
            await sql_con.promise().query(updateLastConnectQuery, [now, userInfoRow[0]['idx']]);

            return res.status(200).json({ userInfoRow: userInfoRow[0] })
        } else {
            return res.status(400).json({})
        }
    } catch (error) {
        console.error(error.message);
    }
})



authRouter.post('/kakao_id_chk', async (req, res, next) => {
    const { sns_id } = req.body;
    try {
        const getUserInfoQuery = "SELECT * FROM users WHERE sns_id = ?";
        const [getUserInfo] = await sql_con.promise().query(getUserInfoQuery, [sns_id]);
        return res.json({ getUserInfo })
    } catch (error) {
        return res.status(400).json({})
    }
})



authRouter.post('/kakao_nickname_duplicatechk', async (req, res, next) => {

    const { nickname } = req.body;

    const nickChkQuery = "SELECT * FROM users WHERE nickname = ?";
    const [nickChk] = await sql_con.promise().query(nickChkQuery, [nickname]);

    res.json({ nickChk })
})


authRouter.post('/kakao_join', async (req, res, next) => {
    const { query_str, query_question, query_values } = req.body;

    try {
        const insertSnsUserQuery = `INSERT INTO users (${query_str}) VALUES (${query_question})`;
        const [result] = await sql_con.promise().query(insertSnsUserQuery, query_values);

        res.json({ insertId: result.insertId })
    } catch (error) {

    }
})


authRouter.post('/kakao_token_update', async (req, res, next) => {
    const { refreshToken, idx } = req.body;
    try {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        const tokenUpdateQuery = `UPDATE users SET refresh_token = ?, connected_at = ? WHERE idx = ?`;
        await sql_con.promise().query(tokenUpdateQuery, [refreshToken, now, idx]);
        return res.json({})
    } catch (error) {
        return res.status(400).json({})
    }
})


export { authRouter }