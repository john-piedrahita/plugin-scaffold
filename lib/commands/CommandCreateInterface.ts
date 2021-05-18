import ora from "ora";
import yargs from "yargs";

import {EMOJIS} from "../utils/emojis";
import {MESSAGES} from "../utils/messages";
import {CommandUtils} from "./CommandUtils";
import {banner, errorMessage} from "../utils/helpers";

export class CommandCreateInterface implements yargs.CommandModule {
    command = "create:interface";
    describe = "Generate a new interface"

    builder(args: yargs.Argv) {
        return args
            .option("n", {
                alias: "name",
                describe: "Name the Interface",
                demandOption: true
            })
            .option("p", {
                alias: "path",
                describe: "File location",
                demandOption: true
            })
    };

    async handler(args: yargs.Arguments) {
        try {
            const fileContent = CommandCreateInterface.getTemplateInterface(args.name as any, args.path as any)

            banner()

            switch (args.path) {
                case "models":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)
                case "service":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)
                case "infra":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)

            }
        } catch (error) {
            errorMessage(error, 'interface')
        }
    }

    /**
     * Get contents interface files
     * @param param
     * @param path
     * @protected
     */
    protected static getTemplateInterface(param: string, path: string) {
        const string = CommandUtils.capitalizeString(param)

        switch (path) {
            case 'models':
                return `export interface I${string}Repository {
    
}`
            case 'service':
                return `export interface I${string}Service {
    
}`
            case 'infra':
                return `export interface I${string} {
    
}`
        }
    }

    protected static async generateFile(type: string, args, fileContent) {
        let basePath: string
        let fileName: string
        let spinner

        setTimeout(() => (spinner = ora('Installing...').start()), 1000)

        switch (type) {
            case 'models':
                basePath = `${process.cwd()}/src/domain/models/gateways`
                fileName = `${args.name}-repository.ts`
                break
            case 'service':
                basePath = `${process.cwd()}/src/domain/use-cases`
                fileName = `${args.name}-service.ts`
                break
            case 'infra':
                basePath = `${process.cwd()}/src/infrastructure/entry-points/gateways`
                fileName = `${args.name}.ts`
                break
        }

        const path = `${basePath}/${fileName}`
        const fileExists = await CommandUtils.fileExists(path)
        if (fileExists) throw MESSAGES.FILE_EXISTS(path)

        await  CommandUtils.createFile(path, fileContent)
        setTimeout(() => {
            spinner.succeed("Installation completed")
            spinner.stopAndPersist({
                symbol: EMOJIS.ROCKET,
                text: MESSAGES.FILE_SUCCESS('Interface', path)
            });
        }, 1000 * 5);
    }
}
