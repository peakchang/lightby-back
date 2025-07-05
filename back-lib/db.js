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
    imgs TEXT NOT NULL,
    thumbnail VARCHAR(255) NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);

ALTER TABLE users ADD COLUMN customer_key VARCHAR(100) UNIQUE AFTER profile_thumbnail;

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  good_count INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS reply (
  idx INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bo_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

*/