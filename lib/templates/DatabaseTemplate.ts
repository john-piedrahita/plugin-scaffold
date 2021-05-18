export class DatabaseTemplate {

    /**
     * Get content mongo-helper.ts file
     */
    static getTemplateMongoDatabase() {
        return `import {MongoClient} from "mongodb";

export const MongoHelper = {
    client: null as MongoClient,
    uri: null as string,
    
    async connect(uri: string): Promise<void> {
       this.uri = uri
       this.client = await MongoClient.connect(uri, {
           useNewUrlParser: true,
           useUnifiedTopology: true
       })
    },
    
    async disconnect(): Promise<void> {
        await this.client.close()
        this.client = null
    },
}`
    }

    /**
     * Get content mysql-helper.ts file
     * @protected
     */
    static getTemplateMysqlDatabase() {
        return `import mysql from "mysql";
import {CONFIG_MYSQL} from "@/application/config/environment";

export const MysqlHelper = {
    connection: null as string,

    async connect(): Promise<void> {
        this.connection = mysql.createConnection(CONFIG_MYSQL)

        await this.connection.connect((err, result) => err ? console.log(err) : console.log("Connected MySQL."))
    },

    async disconnect(): Promise<void> {
        await this.connection.end()
    },
}`
    }

    static getTemplatePostgresDatabase() {
        return `import {Pool} from 'pg'
import {CONFIG_POSTGRES} from "@/application/config/environment";

export const PostgresHelper = {
    connection: null,

    async connect(): Promise<void> {
        this.connection = new Pool(CONFIG_POSTGRES)

        await this.connection.connect((err, result) => err ? console.log(err) : console.log("Connected Postgres."))
    },

    async disconnect():Promise<void> {
        this.connection.close()
    }
}
`
    }

    /**
     * Get content configuration for mongo in server.ts file
     */
    static getTemplateServerMongo() {
        return `import 'module-alias/register'
import fs from "fs"
import dotenv from "dotenv"
import {MongoHelper} from "@/infrastructure/driven-adapters/adapters/mongo-adapter/mongo-helper";
import {MONGODB_URI, PORT} from "@/application/config/environment";


if (fs.existsSync(".env")) dotenv.config({ path: ".env" })

MongoHelper.connect(MONGODB_URI).then(async () => {
    console.log("Connected mongoDB")
    const app = (await import('./config/app')).default
    app.listen(PORT, () => console.log("Server an running on port: " + PORT))
}).catch(err => console.log(err))
`
    }

    /**
     * Get content configuration for mysql in server.ts file
     */
    static getTemplateServerMysql() {
        return `import 'module-alias/register'
import fs from "fs"
import dotenv from "dotenv"
import {MysqlHelper} from "@/infrastructure/driven-adapters/adapters/mysql-adapter/mysql-helper";
import {PORT} from "@/application/config/environment";

if (fs.existsSync(".env")) dotenv.config({ path: ".env" })

MysqlHelper.connect().then(async () => {
    const app = (await import('./config/app')).default
    app.listen(PORT, () => console.log("Server an running on port: " + PORT))
}).catch(err => console.log(err))
`
    }

    /**
     * Get content configuration for postgres in server.ts file
     */
    static getTemplateServerPostgres() {
        return `import 'module-alias/register'
import fs from "fs"
import dotenv from "dotenv"
import {PORT} from "@/application/config/environment";
import {PostgresHelper} from "@/infrastructure/driven-adapters/adapters/postgres-adapter/postgres-helper";

if (fs.existsSync(".env")) dotenv.config({ path: ".env" })

PostgresHelper.connect().then(async () => {
    const app = (await import('./config/app')).default
    app.listen(PORT, () => console.log("Server an running on port: " + PORT))
}).catch(err => console.log(err))
`
    }
}
