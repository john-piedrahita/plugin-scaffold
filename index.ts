#!/usr/bin/env node
import yargs from 'yargs'
import { InitCommand } from "./commands/CommandInit"
import { EntityCreateCommand } from './commands/CommandCreateEntity'
import {ServiceCreateCommand} from "./commands/CommandCreateService";
import {ControllerCreateCommand} from "./commands/CommandCreateController";
import {CommandCreateDatabase} from "./commands/CommandCreateDatabase"

yargs.usage("Usage: $0 <command> [options]")
    .command(new InitCommand())
    .command(new EntityCreateCommand())
    .command(new ServiceCreateCommand())
    .command(new ControllerCreateCommand())
    .command(new CommandCreateDatabase())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .alias("v", "version")
    .help("h")
    .alias("h", "help")
    .argv

require("yargonaut")
    .style("blue")
    .style("yellow", "required")
    .helpStyle("green")
    .errorsStyle("red");