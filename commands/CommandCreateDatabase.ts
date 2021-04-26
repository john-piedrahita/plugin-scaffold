import chalk from "chalk";
import yargs from "yargs";
import { CommandUtils } from "./CommandUtils";
import {exec} from "child_process";

export class CommandCreateDatabase implements yargs.CommandModule {
    command = "create:database"
    describe = "Generate database configuration"

    builder(args: yargs.Argv) {
        return args
            .option("db", {
                alias: "database",
                describe: "Name the database",
                demandOption: true
            })
    }

    async handler(args: yargs.Arguments) {
        try {
            const fileContentMongo = CommandCreateDatabase.getTemplateMongoDatabase()
            const fileContentMysql = CommandCreateDatabase.getTemplateMysqlDatabase()
            const fileContentPostgres = CommandCreateDatabase.getTemplatePostgresDatabase()

            const database: string = args.database as any
            const base = process.cwd()
            const basePath = `${base}/src/infrastructure/driven-adapters/adapters`
            const filename = `${args.database}-helper.ts`
            const path = `${basePath}/${args.database}-adapter/${filename}`

            const fileExists = await CommandUtils.fileExists(path)
            if (fileExists) throw `File ${chalk.blue(path)} already exists`

            switch (database) {
                case "mongo":
                    return await CommandCreateDatabase.getTemplateToCreateDatabase(base, path, fileContentMongo, database)
                case "mysql":
                   return await CommandCreateDatabase.getTemplateToCreateDatabase(base, path, fileContentMysql, database)
                case "postgres":
                    return await CommandCreateDatabase.getTemplateToCreateDatabase(base, path, fileContentPostgres, database)
            }
        } catch (error) {
            console.log(chalk.black.bgRed("Error during database creation:"))
            console.error(error)
            process.exit(1)
        }
    }

    /**
     * Content server.ts file updated
     * @param database
     * @protected
     */
    protected static getTemplateServer(database: string): string {

        switch (database) {
            case "mongo":
                return CommandCreateDatabase.getTemplateServerMongo()
            case "mysql":
                return CommandCreateDatabase.getTemplateServerMysql()
            case "postgres":
                return CommandCreateDatabase.getTemplateServerPostgres()
        }
    }

    /**
     * Content package.json file
     * @param packageJson
     * @param database
     * @protected
     */
    protected static appendPackageJson(packageJson: string, database: string): string {
        const packageJsonContent = JSON.parse(packageJson)

        switch (database) {
            case "mongo":
                packageJsonContent.devDependencies["@shelf/jest-mongodb"] = "^1.2.4"
                packageJsonContent.devDependencies["@types/mongodb"] = "^3.6.12"
                packageJsonContent.dependencies["mongodb"] = "^3.6.6"
                break;
            case "mysql":
                packageJsonContent.dependencies["mysql"] = "^2.18.1"
                break
            case "postgres":
                packageJsonContent.dependencies["pg"] = "^8.6.0"
                break
            default:
                break;
        }

        return JSON.stringify(packageJsonContent, undefined, 3)
    }

    /**
     * Get content mongo-helper.ts file
     * @protected
     */
    protected static getTemplateMongoDatabase() {
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
    protected static getTemplateMysqlDatabase() {
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

    protected static getTemplatePostgresDatabase() {
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
     * Get content generic template for database create
     * @param base
     * @param path
     * @param fileContent
     * @param database
     * @protected
     */
    protected static async getTemplateToCreateDatabase(base, path, fileContent, database) {

        await CommandUtils.deleteFile(base + "/src/application/server.ts")
        await CommandUtils.createFile(path, fileContent)

        const packageJsonContents = await CommandUtils.readFile(base + "/package.json")

        await CommandUtils.createFile(base + "/package.json", CommandCreateDatabase.appendPackageJson(packageJsonContents, database))
        await CommandUtils.createFile(base + "/src/application/server.ts", CommandCreateDatabase.getTemplateServer(database))

        await CommandCreateDatabase.executeCommand("npm install")

        console.log(chalk.blue(`File ${chalk.green(base + "/src/application/server.ts")} has been updated successfully.`))
        console.log(chalk.green(`Database ${chalk.blue(path)} has been created successfully.`))

        switch (database) {
            case "mongo" :
                return console.log(chalk.green(`Continue the configuration of the ${chalk.blue("MONGO_DEVELOPMENT")} variable in the ${chalk.blue(".env")} file`))
            case "mysql" :
            case "postgres":
                return console.log(chalk.green(`Continue setting the environment variables in the ${chalk.blue(".env")} file`))
        }
    }

    /**
     * Generate dependencies for the project
     * @param command
     * @protected
     */
    protected static executeCommand(command: string) {
        console.log(chalk.blue(`Installing dependencies...`))
        return new Promise<string>((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (stdout) return resolve(stdout)
                if (stderr) return reject(stderr)
                if (error) return reject(error)
                resolve("")
            })
        })
    }

    /**
     * Get content configuration for mongo in server.ts file
     * @protected
     */
    protected static getTemplateServerMongo() {
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
     * @protected
     */
    protected static getTemplateServerMysql() {
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
     * @protected
     */
    protected static getTemplateServerPostgres() {
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