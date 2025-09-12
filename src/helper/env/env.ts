import * as dotenv from 'dotenv'

export const getEnv = () => {
    const env = process.env.ENV || "staging";
    if (env) {
        dotenv.config({
            override: false, // CLI variables will override .env variables so that .env variables cannot override CLI variables
            path: `src/helper/env/.env.${env}`
        });
        console.log(`Environment: ${env}`);
    } else {
        console.error("NO ENV PASSED!");
    }
    return env;
}
