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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE site ADD COLUMN thumbnail VARCHAR(255) NOT NULL AFTER imgs;


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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);

*/