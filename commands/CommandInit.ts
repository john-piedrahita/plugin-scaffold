import chalk from "chalk";
import * as path from "path";
import * as yargs from "yargs";
import {exec} from "child_process";
import {CommandUtils} from "./CommandUtils";

export class InitCommand implements yargs.CommandModule {
    command = "init"
    describe = "Generate initial Clean Architecture project structure."
    
    builder(args: yargs.Argv) {
        return args
            .option("n", {
                alias: "name",
                describe: "Name of project directory",
                demandOption: true
            })
            .option("db", {
                alias: "database",
                describe: "Database type you'll use in your project."
            })
            .option("express", {
                describe: "Indicates if express should be included in the project.",
                demandOption: true
            })
            .option("pm", {
                alias: "manager",
                choices: ["npm", "yarn"],
                default: "npm",
                describe: "Install packages, expected values are npm or yarn."
            })
    }
   
    async handler(args: yargs.Arguments) {
        try {
            const database: string = args.database as any || "mysql"
            const isExpress = args.express !== undefined
            const basePath = process.cwd() + (args.name ? ("/" + args.name) : "")
            const projectName = args.name ? path.basename(args.name as any) : undefined
            const installNpm = args.pm !== "yarn"

            await CommandUtils.createFile(basePath + "/package.json", InitCommand.getPackageJsonTemplate(projectName), false)
            await CommandUtils.createFile(basePath + "/.gitignore", InitCommand.getGitIgnoreFile())
            await CommandUtils.createFile(basePath + "/README.md", InitCommand.getReadmeTemplate())
            await CommandUtils.createFile(basePath + "/tsconfig.json", InitCommand.getTsConfigTemplate())
            await CommandUtils.createFile(basePath + "/tsconfig-build.json", InitCommand.getTsConfigBuildTemplate())

            if (isExpress) {
                await CommandUtils.createFile(basePath + "/src/application/config/app.ts", InitCommand.getAppTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/environment.ts", InitCommand.getEnvironmentTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/express-router-adapter.ts", InitCommand.getAdaptRouterTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/middlewares.ts", InitCommand.getMiddlewaresTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/routes.ts", InitCommand.getConfigRoutesTemplate())
                await CommandUtils.createFile(basePath + "/src/application/middlewares/body-parser.ts", InitCommand.getBodyParserTemplate())
                await CommandUtils.createFile(basePath + "/src/application/middlewares/content-type.ts", InitCommand.getContentTypeTemplate())
                await CommandUtils.createFile(basePath + "/src/application/routes/scaffold.ts", InitCommand.getRoutesTemplate())
                await CommandUtils.createFile(basePath + "/src/application/server.ts", InitCommand.getAppServerTemplate(isExpress, database))
                await CommandUtils.createFile(basePath + "/.env-example", InitCommand.getEnvExampleTemplate())
            }

            await CommandUtils.createDirectories(basePath + "/src/domain/models")
            await CommandUtils.createDirectories(basePath + "/src/domain/use-cases/impl")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/adapters")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/factories")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/helpers")
            await CommandUtils.createFile(basePath + "/src/infrastructure/entry-points/gateways/controller.ts", InitCommand.getIControllerTemplate())
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/helpers")
            await CommandUtils.createFile(basePath + "/src/infrastructure/helpers/http.ts", InitCommand.getHttpTemplate())

            await CommandUtils.createDirectories(basePath + "/tests/domain")
            await CommandUtils.createDirectories(basePath + "/tests/infrastructure")

            const packageJsonContents = await CommandUtils.readFile(basePath + "/package.json")
            await CommandUtils.createFile(basePath + "/package.json", InitCommand.appendPackageJson(packageJsonContents, database, isExpress))

            if (args.name) {
                console.log(chalk.green(`Project created inside ${chalk.blue(basePath)} directory.`))
            }

            if (args.pm && installNpm) {
                await InitCommand.executeCommand("npm install")
            } else {
                await InitCommand.executeCommand("yarn install")
            }
        } catch (error) {
            console.log(chalk.black.bgRed("Error during project initialization:"));
            console.error(error);
            process.exit(1);
        }
    }

    protected static executeCommand(command: string) {
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
     * Gets contents content-type.ts file
     * @returns 
     */
    static getContentTypeTemplate(): string {
        return `import {NextFunction, Request, Response} from "express";

export const contentType = (req: Request, res: Response, next: NextFunction): void => {
    res.type('json')
    next()
}`
    }

    /**
     * Gets content body-parser.ts file
     * @returns 
     */
    static getBodyParserTemplate(): string {
        return `import {json} from 'express'

export const bodyParser = json()`
    }

    /**
     * Gets content routes.ts file
     * @returns 
     */
    static getConfigRoutesTemplate(): string {
        return `import {readdirSync} from "fs";
import {Express, Router} from "express";

export default (app: Express): void => {
    const router = Router()
    app.use('/api/v1', router)
    readdirSync(__dirname + '/../routes').map(async file => {
        if (!file.includes('.tests.') && !file.endsWith('.map')) {
            (await import("../routes/" + file)).default(router)
        }
    })
}`
    }

    /**
     * Gets contents middlewares.ts file
     * @returns 
     */
    static getMiddlewaresTemplate(): string {
        return `import {Express} from "express";
import {bodyParser} from "@/application/middlewares/body-parser";
import {contentType} from "@/application/middlewares/content-type";

export default (app: Express): void => {
    app.use(bodyParser)
    app.use(contentType)
}`
    }

    /**
     * Get contents of express-router-adapter.ts file
     * @returns 
     */
    static getAdaptRouterTemplate(): string {
        return `import {Request, Response} from 'express'
import {HttpRequest} from "@/infrastructure/helpers/http";
import {IController} from "@/infrastructure/entry-points/gateways/controller";

export const adaptRoute = (controller: IController) => {
    return async (req: Request, res: Response) => {
        const httpRequest: HttpRequest = {
            body: req.body,
            params: req.params
        }

        const httpResponse = await controller.handle(httpRequest)

        if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
            res.status(httpResponse.statusCode).json(httpResponse.body)
        } else {
            res.status(httpResponse.statusCode).json({
                error: httpResponse.body.message
            })
        }
    }
}`
    }

    /**
     * Get contents of environment.ts file
     * @returns 
     */
    static getEnvironmentTemplate(): string {
        return `import dotenv from "dotenv"
import fs from "fs"

if (fs.existsSync(".env")) {
    dotenv.config({ path: ".env" })
} else {
    dotenv.config({ path: ".env.example" })
}

export const ENVIRONMENT = process.env.NODE_ENV;
const PROD = ENVIRONMENT === "production"

export const SESSION_SECRET = process.env.JWT_SECRET
export const PORT = process.env.PORT
export const MONGODB_URI = PROD
    ? process.env.MONGO_PRODUCTION
    : process.env.MONGO_DEVELOPMENT

if (!SESSION_SECRET) process.exit(1)

if (!MONGODB_URI) {
    if (PROD) {
        console.log("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        console.log("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}`

    }

    /**
     * Gets content of the app.ts file
     * @returns 
     */
    static getAppTemplate(): string {
        return `import express from 'express'
import setupRoutes from '@/application/config/routes'
import setupMiddlewares from '@/application/config/middlewares'

const app = express()
setupMiddlewares(app)
setupRoutes(app)

export default app`
    }

    /**
     * Get contents of the server.ts file
     * @param isExpress
     * @param database
     * @returns
     */
    static getAppServerTemplate(isExpress: boolean, database?: string): string {
        if (isExpress) {
            return `import 'module-alias/register'

async function main() {
    const app = (await import('./config/app')).default
    app.listen(3000, () => console.log(\`Server an running on port: ${3000}\`))
}

main().then(r => r).catch(e => console.log(e))`
        }

        if (isExpress && database === "mongodb") {
            return `import 'module-alias/register'
import {MongoHelper} from "@/infrastructure/driven-adapters/adapters/mongo-adapter/mongo-helper";
import {MONGODB_URI} from "@/application/config/environment";

MongoHelper.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected DB')
        const app = (await import('./config/app')).default
        app.listen(3000, () => console.log('Server an running on port: ' + 3000))
    }).catch(error => console.log(error))`
        }
    }

    /**
     * Get contents of tsconfig.json file
     * @returns 
     */
    static getTsConfigTemplate(): string {
        return JSON.stringify({
            "compilerOptions": {
                "outDir": "./dist",
                "module": "commonjs",
                "target": "es2019",
                "esModuleInterop": true,
                "sourceMap": true,
                "rootDirs": ["src", "tests"],
                "baseUrl": "src",
                "paths": {
                    "@/tests/*": ["../tests/*"],
                    "@/*": ["*"]
                },
            },
            "include": ["src","tests"],
            "exclude": []
        }, undefined, 3)
    }

    /**
     * Gets contents of the new readme.md file.
     * @returns 
     */
    static getReadmeTemplate(): string {
        return `## Awesome Project Build with Clean Architecture

Steps to run this project:

1. Run \`npm i\` command

2. Run \`npm watch\` command
`
    }

    /**
     * 
     * @returns 
     */
    static getGitIgnoreFile(): string {
        return `.idea/
.vscode/
node_modules/
build/
        `   
    }

    /**
     * Gets contents of the package.json file.
     * @param projectName 
     * @returns 
     */
    protected static getPackageJsonTemplate(projectName?: string): string {
        return JSON.stringify({
            name: projectName || "clean-architecture",
            version: "1.0.0",
            description: "Awesome project developed with Clean Architecture",
            scripts: {

            },
            dependencies: {

            },
            devDependencies: {

            },
            _moduleAliases: {

            }
        }, undefined, 3)
    }

    /**
     * Appends to a given package.json template everything needed.
     * @param packageJson 
     * @param database 
     * @param express 
     * @returns 
     */
    protected static appendPackageJson(packageJson: string, database: string, express: boolean): string {
        const packageJsonContent = JSON.parse(packageJson)

        if (!packageJsonContent.devDependencies) packageJsonContent.devDependencies = {}
        Object.assign(packageJsonContent.devDependencies, {
            "@types/node": "^8.0.29",
            "nodemon":"^2.0.7",
            "rimraf": "^3.0.2",
            "ts-node": "3.3.0",
            "typescript": "^4.2.4"
        })

        switch (database) {
            case "mongodb":
                packageJsonContent.devDependencies["@shelf/jest-mongodb"] = "^1.2.4"
                packageJsonContent.devDependencies["@types/mongodb"] = "^3.6.12"
                packageJsonContent.dependencies["mongodb"] = "^3.6.6"
                break;
            default:
                break;
        }

        if (express) {
            packageJsonContent.dependencies["express"] = "^4.17.1"
            packageJsonContent.dependencies["dotenv"] = "^8.2.0"
            packageJsonContent.dependencies["module-alias"] = "^2.2.2"

            packageJsonContent.scripts["start"] = "node ./dist/application/server.js"
            packageJsonContent.scripts["build"] = "rimraf dist && tsc -p tsconfig-build.json"
            packageJsonContent.scripts["watch"] = "nodemon --exec \"npm run build && npm run start\" --watch src --ext ts"

            packageJsonContent._moduleAliases["@"] = "dist"
        }

        return JSON.stringify(packageJsonContent, undefined, 3)
    }

    protected static getEnvExampleTemplate() {
        return `MONGO_DEVELOPMENT=
MONGO_PRODUCTION=
JWT_SECRET=
NODE_ENV=development
HOST=127.0.0.1
PORT=9000`
    }

    private static getTsConfigBuildTemplate() {
        return `{
  "extends": "./tsconfig.json",
  "exclude": [
    "coverage",
    "jest.config.js",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/tests"
  ]
}`
    }

    /**
     * Get content http.ts file
     * @protected
     */
    protected static getHttpTemplate() {
        return `export type HttpRequest = {
body?: any
headers?: any
params?: any
}

export type HttpResponse = {
    statusCode: number
    body: any
}`
    }

    /**
     * Get content controller.ts file
     * @protected
     */
    protected static getIControllerTemplate() {
        return `import {HttpRequest, HttpResponse} from "@/infrastructure/helpers/http";

export interface IController {
    handle: (request: HttpRequest) => Promise<HttpResponse>
}`
    }

    /**
     * Get content routes/scaffold.ts file
     * @protected
     */
    protected static getRoutesTemplate() {
        return `import {Request, Response, Router} from "express";

/**
 * Base router "/api/v1"
 * @param router
 */
export default (router: Router): void => {
    router.get('/', (req: Request, res: Response) => {
        res.json("Welcome to the world of clean architecture.")
    })
}`
    }
}