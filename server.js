import Hapi from "@hapi/hapi"
import dotenv from "dotenv";
import validate from "./service/validate.js";
import hapiAuthJwt2 from "hapi-auth-jwt2";
import routes from "./routes.js";



dotenv.config();

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        // port: 9000,
        // host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Content-Type', 'Authorization'],
                additionalHeaders: ['X-Requested-With'],
            }
        }
    })

    await server.register(hapiAuthJwt2)

    server.auth.strategy("jwt_strategy", "jwt", {
        key: process.env.JWT_SECRET,
        validate,
        verifyOptions: {algorithms: ["HS256"]}
    })

    server.auth.default("jwt_strategy")

    server.route(routes);

    console.log(`server berjalan di ${server.info.uri}`)
    server.start()
}

init()