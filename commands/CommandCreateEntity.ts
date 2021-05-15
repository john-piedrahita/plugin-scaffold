import chalk from 'chalk'
import * as yargs from 'yargs'
import {CommandUtils} from './CommandUtils'


export class EntityCreateCommand implements yargs.CommandModule {
    command = "create:entity";
    describe = "Generates a new entity.";

    builder(args: yargs.Argv) {
        return args
            .option("n", {
                alias: "name",
                describe: "Name of the entity type",
                demand: true
            })
    }
    
    async handler(args: yargs.Arguments) {
        try {

            const fileContent = EntityCreateCommand.getTemplate(args.name as any)
            const fileContentRepository = EntityCreateCommand.getTemplateRepository(args.name as any)

            const basePath = `${process.cwd()}/src/domain/models/`
            const filename = `${args.name}.ts`
            const path = basePath +  filename
            const pathRepository = `${basePath}gateways/${args.name}-repository.ts`

            const fileExists = await CommandUtils.fileExists(path)

            if (fileExists) throw `File ${chalk.blue(path)} already exists`

            await CommandUtils.createFile(pathRepository, fileContentRepository)
            await CommandUtils.createFile(path, fileContent)

            console.log(chalk.green(`Entity ${chalk.blue(path)} has been created successfully.`))
            console.log(chalk.green(`Repository ${chalk.blue(pathRepository)} has been created successfully.`))

        } catch (error) {
            console.log(chalk.black.bgRed("Error during entity creation:"))
            console.error(error)
            process.exit(1)
        }
    }
    
    /**
     * Gets content of the entity file
     * 
     * @param param
     * @returns 
     */
    protected static getTemplate(param: string): string {
        const name = CommandUtils.capitalizeString(param)
        return `export type ${name}Model = {
    // Attributes
}

export type Add${name}Params = Omit<${name}Model, 'id'>
`
    }

    /**
     * Get content repository file
     * @param param
     * @protected
     */
    protected static getTemplateRepository(param: string) {
        const name = CommandUtils.capitalizeString(param)
        return `export interface I${name}Repository {
    
}`;
    }
}
