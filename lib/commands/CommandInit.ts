import ora from "ora";
import chalk from "chalk";
import * as path from "path";
import * as yargs from "yargs";
import {exec} from "child_process";

import {EMOJIS} from "../utils/emojis";
import {MESSAGES} from "../utils/messages";
import {CommandUtils} from "./CommandUtils";
import {banner, errorMessage} from "../utils/helpers";
import {ProjectInitTemplate} from "../templates/ProjectInitTemplate";

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

        let spinner

        try {
            const database: string = args.database as any || "mysql"
            const isExpress = args.express !== undefined
            const basePath = process.cwd() + (args.name ? ("/" + args.name) : "")
            const projectName = args.name ? path.basename(args.name as any) : undefined
            const installNpm = args.pm !== "yarn"

            const fileExists = await CommandUtils.fileExists(basePath)

            banner()

            setTimeout(() => (spinner = ora('Installing...').start()), 1000)

            if (fileExists) throw  MESSAGES.PROJECT_EXISTS(basePath)

            await CommandUtils.createFile(basePath + "/package.json", ProjectInitTemplate.getPackageJsonTemplate(projectName), false)
            await CommandUtils.createFile(basePath + "/.gitignore", ProjectInitTemplate.getGitIgnoreFile())
            await CommandUtils.createFile(basePath + "/README.md", ProjectInitTemplate.getReadmeTemplate())
            await CommandUtils.createFile(basePath + "/tsconfig.json", ProjectInitTemplate.getTsConfigTemplate())
            await CommandUtils.createFile(basePath + "/tsconfig-build.json", ProjectInitTemplate.getTsConfigBuildTemplate())

            if (isExpress) {
                await CommandUtils.createFile(basePath + "/src/application/config/app.ts", ProjectInitTemplate.getAppTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/environment.ts", ProjectInitTemplate.getEnvironmentTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/express-router-adapter.ts", ProjectInitTemplate.getAdaptRouterTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/middlewares.ts", ProjectInitTemplate.getMiddlewaresTemplate())
                await CommandUtils.createFile(basePath + "/src/application/config/routes.ts", ProjectInitTemplate.getConfigRoutesTemplate())
                await CommandUtils.createFile(basePath + "/src/application/middlewares/body-parser.ts", ProjectInitTemplate.getBodyParserTemplate())
                await CommandUtils.createFile(basePath + "/src/application/middlewares/content-type.ts", ProjectInitTemplate.getContentTypeTemplate())
                await CommandUtils.createFile(basePath + "/src/application/routes/index.ts", ProjectInitTemplate.getRoutesTemplate())
                await CommandUtils.createFile(basePath + "/src/application/server.ts", ProjectInitTemplate.getAppServerTemplate(isExpress, database))
                await CommandUtils.createFile(basePath + "/.env", ProjectInitTemplate.getEnvExampleTemplate())
                await CommandUtils.createFile(basePath + "/.env.example", ProjectInitTemplate.getEnvExampleTemplate())
            }

            await CommandUtils.createDirectories(basePath + "/src/domain/models")
            await CommandUtils.createDirectories(basePath + "/src/domain/use-cases/impl")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/adapters")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/factories")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/driven-adapters/utils")
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/entry-points/factories")
            await CommandUtils.createFile(basePath + "/src/infrastructure/entry-points/gateways/controller.ts", ProjectInitTemplate.getIControllerTemplate())
            await CommandUtils.createDirectories(basePath + "/src/infrastructure/utils")
            await CommandUtils.createFile(basePath + "/src/infrastructure/utils/http.ts", ProjectInitTemplate.getHttpTemplate())

            await CommandUtils.createDirectories(basePath + "/tests/domain")
            await CommandUtils.createDirectories(basePath + "/tests/infrastructure")

            const packageJsonContents = await CommandUtils.readFile(basePath + "/package.json")
            await CommandUtils.createFile(basePath + "/package.json", ProjectInitTemplate.appendPackageJson(packageJsonContents, database, isExpress))

            if (args.name) {
                setTimeout(() => {
                    spinner.succeed("Installation completed")
                    spinner.stopAndPersist({
                        symbol: EMOJIS.ROCKET,
                        text: MESSAGES.PROJECT_SUCCESS(basePath)
                    });
                }, 1000 * 5);
            }

            // if (args.pm && installNpm) {
            //     await InitCommand.executeCommand("npm install")
            // } else {
            //     await InitCommand.executeCommand("yarn install")
            // }

        } catch (error) {
            setTimeout(() => (spinner.fail("Installation fail"), errorMessage(error, 'project')), 2000)
        }
    }

    protected static executeCommand(command: string) {
        console.log(chalk.bgYellow(`Installing dependencies...`))
        return new Promise<string>((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: any) => {
                if (stdout) return resolve(stdout)
                if (stderr) return reject(stderr)
                if (error) return reject(error)
                resolve("")
            })
        })
    }
}
