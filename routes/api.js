import express from "express";
import { sql_con } from "../back-lib/db.js";
import bcrypt from 'bcrypt';
import { Storage } from "@google-cloud/storage";

const apiRouter = express.Router();

apiRouter.post('/update_interest', async (req, res, next) => {
    const { idx, jsonStr } = req.body
    console.log(idx);
    console.log(jsonStr);
    try {
        const updateInterestQuery = "UPDATE users SET interest = ? WHERE idx = ?";
        await sql_con.promise().query(updateInterestQuery, [jsonStr, idx]);
    } catch (error) {
        
    }
    
    res.json({})
})


// my 페이지 회원 정보 수정 부분
apiRouter.post('/update_user_info', async (req, res, next) => {

    console.log(req.body);
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
        console.log(newPassword);

        const updatePasswordQuery = "UPDATE users SET password = ? WHERE idx = ?";
        await sql_con.promise().query(updatePasswordQuery, [newPassword, idx]);

    } catch (error) {
        return res.status(400).json({ message: '에러 발생! 관리자에게 문의 주세요!' })
    }


    return res.json({})
})


apiRouter.post('/update_profile', async (req, res, next) => {
    const { type, idx, profile } = req.body;

    console.log(type);
    console.log(idx);
    console.log(profile);

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
            console.log('slfajsdf');

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

// my페이지 진입시 user_info 불러오는 부분
apiRouter.post('/load_user_info', async (req, res, next) => {
    console.log('진입췍');
    const { userIdx } = req.body;
    let userInfo = {};
    try {
        const loadUserInfoQuery = "SELECT * FROM users WHERE idx = ?";
        const [loadUserInfo] = await sql_con.promise().query(loadUserInfoQuery, [userIdx]);
        console.log(loadUserInfo);

        userInfo = loadUserInfo[0]
    } catch (error) {

    }
    res.json({ userInfo })
})

apiRouter.post('/payment_customerkey_chk', async (req, res, next) => {

    console.log('들어왔오!!!');
    const { userId } = req.body;
    console.log(userId);

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
            console.log(customer_key);
            const updateUserCustomerKeyQuery = "UPDATE users SET customer_key = ? WHERE idx = ?";
            await sql_con.promise().query(updateUserCustomerKeyQuery, [customer_key, userId]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.json({ customer_key, user_name });
})

export { apiRouter }