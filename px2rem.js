// npm install inquirer

// node px2rem.js <需要转换的目录或者文件路径>

const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')

// 需要修改的文件总数
let total = 0

const readFile = (filePath, index) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            let source = data.toString()
            let newData = source.replace(/([0-9.]*px)(\)|,|;|\s)/g, (s, pxNum, operator) => {
                let removePxStr = pxNum.replace('px', '')
                let calcNum = Number(removePxStr / 14).toFixed(3)
                let result = parseFloat(calcNum)
                return result + 'rem' + operator
            })
            write(filePath, newData, index)
        }
    })
}

const write = async (filePath, data, index) => {
    fs.writeFileSync(filePath, data, err => {
        if (err) {
            console.log(chalk.red(`${filePath} 文件写入失败, 失败原因:\n${err}`))
        }
    })
    if (total === index + 1) {
        console.log(chalk.greenBright(`共 ${chalk.yellowBright(total)} 个文件修改成功，请查看。\n${chalk.redBright('媒体查询属性请自行手动修改！')}`))
    }
}

/**
 * 获取除node xxx.js之外的参数
 * @param {输入参数位置下标(剔除node xxx.js之后的，从0开始)} index 
 */
const getInputArgs = (index = 0) => {
    let arguments = process.argv.splice(2)
    if (arguments.length) {
        return arguments[index]
    }
    return undefined
}


const getAllFilesPath = async (rootPath = './') => {

    let filePaths = []

    function loop(path) {
        let fileNames = fs.readdirSync(path)
        fileNames.forEach(fileName => {
            let curFilePath = path + fileName
            // 如果不是文件夹，判断是否是需要修改的文件类型
            if (!fs.statSync(curFilePath).isDirectory()) {
                if (/.(scss|less|css)$/g.test(fileName)) {
                    filePaths.push(curFilePath)
                }
            } else {
                loop(curFilePath + '/')
            }
        })
    }
    loop(rootPath.endsWith('/') ? rootPath : rootPath + '/')
    total = filePaths.length
    console.log(`共扫描到 ${chalk.yellow(total)} 个css文件:`)
    console.table(filePaths)

    const promptList = [{
        type: "confirm",
        message: `是否对所有（共 ${chalk.yellow(total)} 个）css文件执行px转rem？`,
        name: "next",
    }]
    inquirer.prompt(promptList).then(answers => {
        if (answers.next) {
            console.log()
            console.log('正在执行, 请稍等...')
            console.log()
            filePaths.forEach((filePath, index) => readFile(filePath, index))
        }
    })
}

getAllFilesPath(getInputArgs())
