import mysql, { } from "mysql2"
import dotenv from "dotenv"
dotenv.config();


export const sql_con = mysql.createConnection({
  host: process.env.HOST || '127.0.0.1',
  user: 'root',
  password: process.env.DBPWD,
  database: process.env.SHEMA,
  charset: 'utf8mb4'
})





/*

CREATE DATABASE lightby default CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS site(
    idx INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    imgs TEXT,
    thumbnail VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    point TEXT,
    addr VARCHAR(100) NOT NULL,
    res_addr VARCHAR(255) NOT NULL,
    latitude VARCHAR(100) NOT NULL,
    longtitude VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    agency VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    business VARCHAR(255) NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    career VARCHAR(100),
    number_people VARCHAR(50),
    fee_type VARCHAR(10),
    fee VARCHAR(50),
    daily_expense VARCHAR(50),
    sleep_expense VARCHAR(50),
    promotion VARCHAR(50),
    base_pay VARCHAR(50),
    detail_content TEXT,
    product VARCHAR(100) NOT NULL,
    icons VARCHAR(100),
    sum INT,
    payment_key VARCHAR(255) UNIQUE,
    view_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

0721 수정!! thumbnail / imgs NOT NULL 빼기!!
ALTER TABLE site MODIFY COLUMN imgs TEXT NULL;
ALTER TABLE site MODIFY COLUMN thumbnail VARCHAR(255) NULL;

0724 수정!! viewcount 추가!!

ALTER TABLE site ADD COLUMN view_count INT DEFAULT 0 AFTER payment_key;
ALTER TABLE board_fee ADD COLUMN view_count INT DEFAULT 0 AFTER content;

0725 수정!!  추가!!
ALTER TABLE site ADD COLUMN ad_start_date DATE AFTER view_count;
ALTER TABLE site ADD COLUMN ad_end_date DATE AFTER ad_start_date;
-----------------


ALTER TABLE site ADD COLUMN thumbnail VARCHAR(255) NOT NULL AFTER imgs;
ALTER TABLE site ADD COLUMN longtitude VARCHAR(100) NOT NULL AFTER res_addr;
ALTER TABLE site ADD COLUMN latitude VARCHAR(100) NOT NULL AFTER res_addr;

// 0612 상품명 / 아이콘리스트 / 합계금액 (결제금액) / 
ALTER TABLE site ADD COLUMN sum INT AFTER detail_content;
ALTER TABLE site ADD COLUMN icons VARCHAR(100) AFTER detail_content;
ALTER TABLE site ADD COLUMN product VARCHAR(100) NOT NULL AFTER detail_content;

ALTER TABLE site ADD COLUMN payment_key VARCHAR(255) UNIQUE AFTER sum;


CREATE TABLE IF NOT EXISTS users(
    idx INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id VARCHAR(50) UNIQUE,
    sns_id VARCHAR(50) UNIQUE,
    password VARCHAR(150),
    phone VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50),
    nickname VARCHAR(50) UNIQUE,
    rate VARCHAR(5) DEFAULT 1,
    profile_image VARCHAR(255),
    profile_thumbnail VARCHAR(255),
    customer_key VARCHAR(100) UNIQUE,
    interest TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);


ALTER TABLE users ADD COLUMN age VARCHAR(10) AFTER nickname;
ALTER TABLE users ADD COLUMN gender VARCHAR(10) AFTER nickname;
ALTER TABLE users ADD COLUMN career TEXT AFTER nickname;
ALTER TABLE users ADD COLUMN introduction TEXT AFTER nickname;




ALTER TABLE users ADD COLUMN interest TEXT AFTER customer_key;

ALTER TABLE users ADD COLUMN customer_key VARCHAR(100) UNIQUE AFTER profile_thumbnail;

CREATE TABLE IF NOT EXISTS favorites (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS board_fee (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  imgs TEXT,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  view_count INT DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE board_fee DROP COLUMN good_count;


CREATE TABLE IF NOT EXISTS reply (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bo_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE post_likes (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    is_liked BOOL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id)
);

// QNA 테이블, 질문자가 관리자 (등급 5 이상)면 FAQ로, 아니면 개별 QnA로!!
CREATE TABLE qna (
    idx INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question TEXT,
    question_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    answer TEXT,
    answer_created_at DATETIME,
    faq_bool BOOLEAN DEFAULT FALSE
);


CREATE TABLE basic_env(
    base BOOLEAN DEFAULT TRUE,
    banners TEXT,
    banner_links TEXT
);

CREATE TABLE today_count(
    idx INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    fake_count INT,
    real_count INT
);

*/