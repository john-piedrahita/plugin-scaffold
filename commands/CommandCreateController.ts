import yargs from "yargs";
import chalk from "chalk";
import {CommandUtils} from "./CommandUtils";

export class ControllerCreateCommand implements yargs.CommandModule {
    command = "create:controller"
    describe = "Generates a new controller."

    builder(args: yargs.Argv) {
        return args
            .option('n', {
                alias: "name",
                describe: "Name the Controller class",
                demandOption: true
            })
    }

    async handler(args: yargs.Arguments) {
        try {

            const fileContent = ControllerCreateCommand.getTemplateController(args.name as any)

            const basePath = `${process.cwd()}/src/infrastructure/entry-points/api/`
            const filename = `${args.name}-controller.ts`
            const path = `${basePath}${filename}`
            const fileExists = await CommandUtils.fileExists(path)

            if (fileExists) throw `File ${chalk.blue(path)} already exists`

            await CommandUtils.createFile(path, fileContent)

            console.log(chalk.green(`Controller ${chalk.blue(path)} has been created successfully`))

        } catch (error) {
            console.log(chalk.black.bgRed("Error during service creation:"))
            console.error(error)
            process.exit(1)
        }
    }

    /**
     * Get content controllers files
     * @param param
     * @protected
     */
    protected static getTemplateController(param: string) {
        const name = CommandUtils.capitalizeString(param)

        return `import {IController} from "@/infrastructure/entry-points/gateways/controller";
import {HttpRequest, HttpResponse} from "@/infrastructure/helpers/http";

export class ${name}Controller  implements IController {
    
    async handle(request: HttpRequest): Promise<HttpResponse> {
        // Implementation
        return
    }
}`
    }
}
