import express from "express";
import { sql_con } from "../back-lib/db.js";
import axios from 'axios'
import qs from 'qs'

const apiRouter = express.Router();


apiRouter.post('/upload_client', async (req, res, next) => {
    let status = true;
    const body = req.body;

    try {
        const insertClientQuery = "INSERT INTO client (cl_name, cl_phone) VALUES (?,?)";
        await sql_con.promise().query(insertClientQuery, [body.client_name, body.client_phone]);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})


apiRouter.post('/upload_customer_info', async (req, res, next) => {
    let status = true;
    const body = req.body;


    try {
        const insertCustomerInfoQuery = "INSERT INTO cu_info (cu_name, cu_phone, cu_land) VALUES (?,?,?)";
        await sql_con.promise().query(insertCustomerInfoQuery, [body.cu_name, body.cu_phone, body.cu_land]);

        const getLandNameQuery = "SELECT ld_name FROM land WHERE ld_id = ?"
        const getLandName = await sql_con.promise().query(getLandNameQuery, [body.cu_land]);
        const landName = '이집어때 ' + getLandName[0][0].ld_name

        let data = qs.stringify({
            'apikey': process.env.ALIGOKEY,
            'userid': process.env.ALIGOID,
            'senderkey': process.env.ALIGO_SENDERKEY,
            'tpl_code': 'TM_5684',
            'sender': '010-4478-1127',
            'receiver_1': '010-4478-1127',
            'receiver_2': '010-2190-2197',
            //'recvname_1': '수신자명을 입력합니다',
            'subject_1': '분양정보 신청고객 알림톡',
            'subject_2': '분양정보 신청고객 알림톡',
            'message_1': `고객 인입 안내!\n${landName} ${body.cu_name}님 접수되었습니다.\n고객 번호 : ${body.cu_phone}`,
            'message_2': `고객 인입 안내!\n${landName} ${body.cu_name}님 접수되었습니다.\n고객 번호 : ${body.cu_phone}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://kakaoapi.aligo.in/akv10/alimtalk/send/',
            headers: {},
            data: data
        };

        const response = await axios.request(config);
        console.log(response.data);

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status })
})



apiRouter.post('/get_view', async (req, res, next) => {
    let status = true;
    let view_data = [];
    const body = req.body;
    try {
        const loadViewDataQuery = "SELECT * FROM land WHERE ld_id = ?";
        const loadView = await sql_con.promise().query(loadViewDataQuery, [body.params]);
        view_data = loadView[0][0];
    } catch (error) {

    }

    res.json({ status, view_data })
})


// 메인 페이지 리스트 불러오기~~


apiRouter.post('/update_land_list', async (req, res, next) => {
    console.log('들어는 와야지!!!');
    let status = true;
    let add_land_list = [];

    const body = req.body;
    const getLocation = body.getLocation;
    let addQuery = ""
    let addLandNum = body.add_land_num
    console.log(body);

    if (getLocation && getLocation != '전체') {
        addQuery = `WHERE ld_location = '${getLocation}'`
    }

    try {
        const loadLandListQuery = `SELECT * FROM land ${addQuery} ORDER BY ld_id DESC LIMIT ${addLandNum}, 12;`;
        console.log(loadLandListQuery);
        const loadLandList = await sql_con.promise().query(loadLandListQuery);
        add_land_list = loadLandList[0];
    } catch (error) {

    }
    console.log(add_land_list);
    console.log(add_land_list.length);

    res.json({ status, add_land_list })
})


apiRouter.post('/load_land_list', async (req, res, next) => {
    let status = true;
    let land_list = [];

    const body = req.body;
    const getLocation = body.getLocation;
    let addQuery = ""
    console.log(body);

    if (getLocation && getLocation != '전체') {
        addQuery = `WHERE ld_location = '${getLocation}'`
    }

    try {
        const loadLandListQuery = `SELECT * FROM land ${addQuery} ORDER BY ld_id DESC LIMIT 0, 12;`;
        console.log(loadLandListQuery);
        const loadLandList = await sql_con.promise().query(loadLandListQuery);
        land_list = loadLandList[0];
    } catch (error) {

    }

    res.json({ status, land_list })
})


export { apiRouter }