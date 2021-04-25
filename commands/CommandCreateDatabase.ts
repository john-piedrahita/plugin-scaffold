import chalk from "chalk";
import yargs from "yargs";
import { CommandUtils } from "./CommandUtils";

export class CommandCreateDatabase implements yargs.CommandModule {
    command = "create:database"
    describe = "Generate database configuration"

    builder(args: yargs.Argv) {
        return args
            .option("n", {
                alias: "database",
                describe: "Name the database",
                demandOption: true
            })
    }

    async handler(args: yargs.Arguments) {
        try {
            const fileContent = CommandCreateDatabase.getTemplateMongoDatabase(args.database as any)

            const database: string = args.database as any
            const base = process.cwd()
            const basePath = `${base}/src/infrastructure/driven-adapters/adapters`
            const filename = `${args.database}-helper.ts`
            const path = `${basePath}/${args.database}-adapter/${filename}`

            const fileExists = await CommandUtils.fileExists(path)
            if (fileExists) throw `File ${chalk.blue(path)} already exists`

            switch (database) {
                case "mongo":
                    await CommandUtils.deleteFile(base + "/src/application/server.ts")
                    await CommandUtils.createFile(path, fileContent)

                    const packageJsonContents = await CommandUtils.readFile(base + "/package.json")

                    await CommandUtils.createFile(base + "/package.json", CommandCreateDatabase.appendPackageJson(packageJsonContents, database))
                    await CommandUtils.createFile(base + "/src/application/server.ts", CommandCreateDatabase.getTemplateServer())

                    console.log(chalk.blue(`File ${chalk.green(base + "/src/application/server.ts")} has been updated successfully.`))
                    console.log(chalk.green(`Database configuration ${chalk.blue(path)} has been created successfully.`))
                case "mysql":
                    // TODO
                    break
                case "postgress":
                    // TODO
                    break
            }
        } catch (error) {
            console.log(chalk.black.bgRed("Error during database creation:"))
            console.error(error)
            process.exit(1)
        }
    }

    protected static getTemplateServer(): string {
        return `import 'module-alias/register'
import {MongoHelper} from "@/infrastructure/driven-adapters/adapters/mongo-adapter/mongo-helper";
import {MONGODB_URI} from "@/application/config/environment";

MongoHelper.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected DB')
        const app = (await import('./config/app')).default
        app.listen(3000, () => console.log(\`Server an running on port: ${3000}\`))
    }).catch(error => console.log(error))`

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
                // TODO
                break
            case "postgress":
                // TODO
                break
            default:
                break;
        }

        return JSON.stringify(packageJsonContent, undefined, 3)
    }

    /**
     * Get content mongo-helper.ts file
     * @param database
     * @protected
     */
    protected static getTemplateMongoDatabase(database: any) {
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
}