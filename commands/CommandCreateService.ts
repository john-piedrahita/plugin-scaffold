import yargs from "yargs";
import chalk from "chalk";
import {CommandUtils} from "./CommandUtils";

export class ServiceCreateCommand implements yargs.CommandModule {
    command = "create:service";
    describe = "Generates a new service.";

    builder(args: yargs.Argv) {
        return args
            .option("n", {
                alias: "name",
                describe: "Name the Service class",
                demandOption: true
            })
    };

    async handler(args: yargs.Arguments) {
        try {

            const fileContent = ServiceCreateCommand.getTemplateService(args.name as any)
            const fileContentRepository = ServiceCreateCommand.getTemplateIServices(args.name as any)

            const basePath = `${process.cwd()}/src/domain/use-cases/`
            const filename = `${args.name}-service-impl.ts`
            const path = `${basePath}impl/${filename}`
            const pathRepository = `${basePath + args.name}-service.ts`

            const fileExists = await CommandUtils.fileExists(path)

            if (fileExists) throw `File ${chalk.blue(path)} already exists`

            await CommandUtils.createFile(pathRepository, fileContentRepository)
            await CommandUtils.createFile(path, fileContent)

            console.log(chalk.green(`Services ${chalk.blue(path)} has been created successfully`))
            console.log(chalk.green(`Repository ${chalk.blue(pathRepository)} has been created successfully`))

        } catch (error) {
            console.log(chalk.black.bgRed("Error during service creation:"))
            console.error(error)
            process.exit(1)
        }
    }

    /**
     * Get contents services files
     * @param param
     * @protected
     */
    protected static getTemplateService(param: any) {
        const name = param.charAt(0).toUpperCase() + param.slice(1)
        return `import {I${name}Service} from "@/domain/use-cases/${param}-service";

export class ${name}ServiceImpl implements I${name}Service {

}`
    }

    /**
     * Get contents interface files
     * @param param
     * @protected
     */
    protected static getTemplateIServices(param: string) {
        const name = param.charAt(0).toUpperCase() + param.slice(1)
        return `export interface I${name}Service {

}`
    }
}