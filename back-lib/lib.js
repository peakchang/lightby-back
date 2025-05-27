import nodemailer from 'nodemailer';
import multer from 'multer';
import MulterGoogleCloudStorage from "multer-google-storage";

import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

export let imageUpload

// 이미지 업로드 부분!! 파일 1개 / 여러개 공통으로 사용 가능!!
imageUpload = multer({
    storage: MulterGoogleCloudStorage.storageEngine({
        bucket: process.env.GCS_BUCKET_NAME,
        projectId: process.env.GCS_PROJECT,
        keyFilename: process.env.GCS_KEY_FILE,
        acl: 'publicRead',
        contentType: MulterGoogleCloudStorage.AUTO_CONTENT_TYPE, // ✅ 중요!!
        // contentType: "image/jpeg",
        filename: (req, file, cb) => {
            const now = moment().format('YYMMDD')
            cb(null, `imgs/imgs${now}/${file.originalname}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});




export const mailSender = {
    // 메일발송 함수
    sendEmail: function (reciever, subject, content) {
        var transporter = nodemailer.createTransport({
            service: 'naver',   // 메일 보내는 곳
            prot: 465,
            host: 'smtp.naver.com',
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.N_MAIL_ID,
                pass: process.env.N_MAIL_PWD
            }
        });
        // 메일 옵션
        var mailOptions = {
            from: `${process.env.N_MAIL_ID}@naver.com`, // 보내는 메일의 주소
            to: reciever, // 수신할 이메일
            subject: subject, // 메일 제목
            html: content // 메일 내용
        };

        // 메일 발송    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                // console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}


export const getQueryStr = (data, type, addTimeStr = '') => {
    let returnData = {
        str: '',
        question: '',
        values: []
    }
    if (type == 'insert') {

        for (const key in data) {
            returnData['str'] = returnData['str'] + `${key},`
            returnData['question'] = returnData['question'] + `?,`
            returnData['values'].push(data[key])
        }

        if (addTimeStr) {

            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            returnData['str'] = returnData['str'] + addTimeStr;
            returnData['question'] = returnData['question'] + '?';
            returnData['values'].push(now)
        } else {
            returnData['str'] = returnData['str'].replace(/,$/, '');
            returnData['question'] = returnData['question'].replace(/,$/, '');
        }

    } else if (type == 'update') {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        for (const key in data) {
            returnData['str'] = returnData['str'] + `${key}=?,`
            returnData['values'].push(data[key])
        }

        if (addTimeStr) {
            returnData['str'] = returnData['str'] + `${addTimeStr} = ?`;
            returnData['values'].push(now)
        } else {
            returnData['str'] = returnData['str'].replace(/,$/, '');
        }

    }

    return returnData;
}

// axios 대용 API 요청 보내기!
export async function fetchRequest(method, url, data = {}, headers = {}) {
    const returnObj = { status: true };

    try {
        const isGet = method.toUpperCase() === 'GET';

        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (!isGet) {
            options.body = JSON.stringify(data);
        }

        const res = await fetch(url, options);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || '서버 오류');
        }

        const result = await res.json();
        returnObj.data = result;
        return returnObj;

    } catch (err) {
        console.error(`Fetch ${method.toUpperCase()} Error:`, err);
        returnObj.status = false;
        returnObj.message = err.message || '서버와의 통신에 실패했습니다.';

        return returnObj;
    }
}

