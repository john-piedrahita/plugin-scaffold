import * as fs from 'fs'
import * as path from 'path'
import mkdirp from 'mkdirp'

export class CommandUtils {

    /**
     * Creates directories recursively
     * 
     * @param directory 
     * @returns 
     */
    static createDirectories(directory: string) {
        return mkdirp(directory, 0o777)
    }

    /**
     * Creates a file with the given content in the given path
     * 
     * @param filePath 
     * @param content 
     * @param override 
     * @returns 
     */
    static async createFile(filePath: string, content: string, override: boolean = true): Promise<void> {
        await CommandUtils.createDirectories(path.dirname(filePath))
        return new Promise<void>((resolve, reject) => {
            if (override === false && fs.existsSync(filePath))
                return resolve()
            
            fs.writeFile(filePath, content, err => err ? reject(err) : resolve())
        })
    }

    /**
     * Reads everything from a given file and returns its content as a string
     * 
     * @param filePath 
     * @returns 
     */
    static async readFile(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, (err, data) => err ? reject(err) : resolve(data.toString()))
        })
    }

    /**
     * @param filePath 
     * @returns 
     */
    static async fileExists(filePath: string) {
        return fs.existsSync(filePath)
    }

    /**
     * @param filePath
     */
    static async deleteFile(filePath: string) {
        return fs.unlink(filePath, () => console.log("File deleted"))
    }
}