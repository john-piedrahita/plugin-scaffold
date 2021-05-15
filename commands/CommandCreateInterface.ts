import yargs from "yargs";
import chalk from "chalk";
import {CommandUtils} from "./CommandUtils";

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

            switch (args.path) {
                case "models":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)
                case "service":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)
                case "infra":
                    return await CommandCreateInterface.generateFile(args.path, args, fileContent)

            }
        } catch (error) {
            console.log(chalk.black.bgRed("Error during interface creation:"))
            console.error(error)
            process.exit(1)
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
        if (fileExists) throw `File ${chalk.blue(path)} already exists`

        await  CommandUtils.createFile(path, fileContent)
        console.log(chalk.green(`Interface ${chalk.blue(path)} has been created successfully`))
    }
}
