import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();

export const deleteCache = async (pattern : string) => {
    let cursor : string= "0";

    do {
        const result = await redisClient.scan(cursor, {
            MATCH: pattern,
            COUNT: 100
        });

        cursor = result.cursor;
        const keys = result.keys;
        console.log(keys)
        if (keys.length > 0) await redisClient.del(keys);

    } while (Number(cursor) !== 0);

    console.log(`${pattern} cache successfully deleted`);
};

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

export const connectRedis = async () => {
    await redisClient.connect();
    console.log("Redis Connected!");
};

export default redisClient;