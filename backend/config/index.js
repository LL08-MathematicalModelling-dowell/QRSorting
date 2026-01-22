import dotenv from 'dotenv';

dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY ,
    JWT_EXPIRY: process.env.JWT_EXPIRY ,
    JWT_SECRET: process.env.JWT_SECRET,
    redisHost: process.env.REDIS_HOST ,
    redisPort: process.env.REDIS_PORT ,
    redisPassword: process.env.REDIS_PASSWORD 
};


console.log(config);

export default config;

