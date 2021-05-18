export class ProjectInitTemplate {

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
        return `import cors from "cors";
import {Express} from "express";
import {bodyParser} from "@/application/middlewares/body-parser";
import {contentType} from "@/application/middlewares/content-type";

export default (app: Express): void => {
    app.use(bodyParser)
    app.use(contentType)
    app.use(cors())
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
        return `import dotenv from "dotenv";

dotenv.config({ path: ".env" })


/**
|----------------------------------------------------------------------------------------|
    App Configuration
|----------------------------------------------------------------------------------------|
*/
export const ENVIRONMENT = process.env.NODE_ENV;
const PROD = ENVIRONMENT === "production"
export const PORT = process.env.PORT


/**
|----------------------------------------------------------------------------------------|
    Authentication Configuration
|----------------------------------------------------------------------------------------|
*/

export const SESSION_SECRET = process.env.JWT_SECRET || ""

/**
* Use only if you include jwt
*/
// if (!SESSION_SECRET) process.exit(1)


/**
|----------------------------------------------------------------------------------------|
    Databases Configuration
|----------------------------------------------------------------------------------------|
*/

/**
*  MySQL
*/
export const CONFIG_MYSQL = {
    host     : process.env.HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DATABASE
}

/**
*  Mongo DB
*/
export const MONGODB_URI = PROD
    ? process.env.MONGO_PRODUCTION
    : process.env.MONGO_DEVELOPMENT
    
/**
 * Postgres
 */
export const CONFIG_POSTGRES = {
    host    : process.env.HOST,
    user    : process.env.DB_USER_POSTGRES,
    database: process.env.DATABASE_POSTGRES,
    password: process.env.DB_PASSWORD_POSTGRES,
    port: 5432,
}
`

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
import {PORT} from "@/application/config/environment";

async function main() {
    const app = (await import('./config/app')).default
    app.listen(PORT, () => console.log("Server an running on port: " + PORT))
}

main().then(r => r).catch(e => console.log(e))
`

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
.env
package-lock.json
dist
        `
    }

    /**
     * Gets contents of the package.json file.
     * @param projectName
     * @returns
     */
    static getPackageJsonTemplate(projectName?: string): string {
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
    static appendPackageJson(packageJson: string, database: string, express: boolean): string {
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
            packageJsonContent.dependencies["cors"] = "^2.8.5"
            packageJsonContent.dependencies["dotenv"] = "^8.2.0"
            packageJsonContent.dependencies["express"] = "^4.17.1"
            packageJsonContent.dependencies["module-alias"] = "^2.2.2"

            packageJsonContent.devDependencies["@types/cors"] = "^2.8.10"
            packageJsonContent.devDependencies["@types/express"] = "^4.17.11"

            packageJsonContent.scripts["start"] = "node ./dist/application/server.js"
            packageJsonContent.scripts["build"] = "rimraf dist && tsc -p tsconfig-build.json"
            packageJsonContent.scripts["watch"] = "nodemon --exec \"npm run build && npm run start\" --watch src --ext ts"

            packageJsonContent._moduleAliases["@"] = "dist"
        }

        return JSON.stringify(packageJsonContent, undefined, 3)
    }

    static getEnvExampleTemplate() {
        return `# Mongo configuration
MONGO_DEVELOPMENT=
MONGO_PRODUCTION=

# Mysql configuration
DB_USER=
DB_PASSWORD=
DATABASE=

JWT_SECRET=
NODE_ENV=development
HOST=127.0.0.1
PORT=9000`
    }

    static getTsConfigBuildTemplate() {
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
    static getHttpTemplate() {
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
    static getIControllerTemplate() {
        return `import {HttpRequest, HttpResponse} from "@/infrastructure/helpers/http";

export interface IController {
    handle: (request: HttpRequest) => Promise<HttpResponse>
}`
    }

    /**
     * Get content routes/index.ts file
     * @protected
     */
    static getRoutesTemplate() {
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
