import ora from "ora";
import yargs from "yargs";

import {EMOJIS} from "../utils/emojis";
import {MESSAGES} from "../utils/messages";
import {CommandUtils} from "./CommandUtils";
import {banner, errorMessage} from "../utils/helpers";

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
        let spinner

        try {
            const fileContent = ControllerCreateCommand.getTemplateController(args.name as any)
            const basePath = `${process.cwd()}/src/infrastructure/entry-points/api/`
            const filename = `${args.name}-controller.ts`
            const path = `${basePath}${filename}`
            const fileExists = await CommandUtils.fileExists(path)

            banner()

            setTimeout(() => (spinner = ora('Installing...').start()), 1000)

            if (fileExists) throw MESSAGES.FILE_EXISTS(path)

            await CommandUtils.createFile(path, fileContent)

            setTimeout(() => {
                spinner.succeed("Installation completed")
                spinner.stopAndPersist({
                    symbol: EMOJIS.ROCKET,
                    text: MESSAGES.FILE_SUCCESS('Controller', path)
                });
            }, 1000 * 5);

        } catch (error) {
            setTimeout(() => (spinner.fail("Installation fail"), errorMessage(error, 'controller')), 2000)
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
