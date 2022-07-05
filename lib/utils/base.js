#!/usr/bin/env node
/*
 * @Description: 公用方法
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-10-11 09:46:48
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-07-05 14:35:54
 * @FilePath: \keyUpload\lib\utils\base.js
 */
const shell = require('shelljs')
const path = require('path')
const fs = require('fs')
const defaultConfig = require('./config.js') // 默认配置参数
const { getStat } = require('./utils.js') // 工具集
const program = require('commander')
const packageJson = require('../../package.json')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const moment = require('dayjs')
const { playMusic } = require('./playMusic.js') // 播放音乐

let NODE_ENV = process.env.NODE_ENV || 'dev' // 当前运行环境变量与运行命令,可通过设置cross-env NODE_ENV=xxx实现自定义环境

const PRESET_PATH = path.resolve(__dirname, './')
/**
 * @author: yiling (315800015@qq.com)
 * @description: 检查客户端配置文件是否存在
 * @param {*}
 * @return {*}
 * @Date: 2022-06-13 11:15:08
 */
const clientConfiguration = path.join(process.cwd(), defaultConfig.configPath) // 获取客户端的配置
const checkClientConfiguration = async () => {
  // 查找客户端配置文件
  const isExists = await getStat(clientConfiguration)
  if (!isExists) {
    msg(chalk.redBright(defaultConfig.configPath), '请检查配置或查看帮助 ' + chalk.greenBright('npx key-upload -h'))
    shell.exit()
  }
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 获取版本信息
 * @return {*}
 * @Date: 2022-06-24 15:16:07
 */
const getVersionInfo = () => {
  const help = `
  key-upload -V // 获取版本信息（全局安装时可用）\n
  key-upload init // 自动创建配置文件\n
  key-upload initUniH5 // 自动创建配置文件（仅限于用vue-cli创建的uni-app项目）\n
  npx key-upload -V // 获取版本信息（项目内安装时要加npx）\n
  npx key-upload init // 自动创建配置文件（项目内安装时要加npx）\n
  npx key-upload initUniH5 // 自动创建配置文件（仅限于用vue-cli创建的uni-app项目，项目内安装时要加npx）\n
  npm run key-upload:dev ssh   // 测试[开发]服务器连接情况\n
  npm run key-upload:dev uniH5   // 打包开发环境并上传到服务器（仅限于vue-cli创建的uni-app项目(vue2)的H5端）\n
  npm run key-upload:dev // 打包开发环境并上传到服务器\n
  npm run key-upload:test // 打包测试环境并上传到服务器\n
  npm run key-upload:pre // 打包预上线环境并上传到服务器\n
  npm run key-upload:prod // 打包正式环境并上传到服务器\n
  npm run key-upload:dev git // 打包开发环境并上传到git仓库（不需要在packges.json中配置）\n
  npm run key-upload:dev:git // 打包开发环境并上传到git仓库（需要在packges.json中配置）\n
  npm run key-upload:dev zip // 打包开发环境为压缩包并上传到服务器
  `
  program.version(packageJson.version).option('-h, --help', '帮助信息')
  // program.option('-V, --version', '版本号', packageJson.version).option('-h, --help', '帮助信息', help)
  program.parse()
  const options = program.opts()
  if (options.help) {
    shell.echo(chalk.yellowBright('可使用命令：'), help)
    shell.exit()
  }
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 创建客户端配置文件
 * @param {Boolean} isUniH5 是否是uni-app项目
 * @return {*}
 * @Date: 2022-06-24 10:04:42
 */
const createdClientConfiguration = async (isUniH5) => {
  // 查找客户端配置文件
  const isExists = await getStat(clientConfiguration)
  if (!isExists) {
    msg(chalk.redBright(defaultConfig.configPath), '正在尝试创建默认配置文件')
    const initDefaultConfig = path.resolve(PRESET_PATH, '../utils/defaultConfig.js')
    let PROJECT_CONFIG = fs.readFileSync(initDefaultConfig).toString()
    // 如果是uni-app项目，动态修改 distPath
    if (isUniH5) {
      PROJECT_CONFIG = PROJECT_CONFIG.replace(/distPath\:\s+\'\/dist\/(.*?)\'/g, "distPath: '/dist/build/h5/$1'")
    }
    fs.writeFileSync(clientConfiguration, PROJECT_CONFIG)
    const isExists2 = await getStat(clientConfiguration)
    if (!isExists2) {
      shell.echo('尝试创建默认文件', chalk.redBright(defaultConfig.configPath), '失败！请手动创建')
      shell.exit()
    }
    shell.echo('默认配置文件', chalk.greenBright(defaultConfig.configPath), '已创建成功，快去修改吧！')
    shell.exit()
  }
  shell.echo('默认配置文件', chalk.greenBright(defaultConfig.configPath), '已存在')
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 检查package.json配置文件是否存在
 * @param {Object} config 配置信息
 * @return {*}
 * @Date: 2021-10-11 09:40:17
 */
const checkPackageJson = async (config) => {
  // console.log('查找配置文件前', Date.now())
  // 查找配置文件
  const PACKAGE = path.join(process.cwd(), 'package.json')
  const isExistsPackage = await getStat(PACKAGE)
  if (!isExistsPackage) {
    msg(chalk.redBright('package.json'))
    shell.exit()
  }
  const PACKAGE_JSON = JSON.parse(fs.readFileSync(PACKAGE).toString())
  // 检查打包命令
  if (!PACKAGE_JSON.scripts[config[NODE_ENV].script]) {
    msg(chalk.redBright('打包命令' + (config[NODE_ENV].script || 'script')))
    shell.exit()
  }
  config[NODE_ENV].script = PACKAGE_JSON.scripts[config[NODE_ENV].script]
  // 检查项目类型
  config[NODE_ENV].isUniApp = !!JSON.stringify(PACKAGE_JSON.dependencies).match(/@dcloudio\/uni-/) // uni-app项目
}

/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 检查配置项是否有误
 * @param {*}
 * @return {*}
 * @Date: 2021-09-25 10:09:41
 */
const checkConfigurationItems = async (config) => {
  // console.log('检查配置项是否有误', Date.now())
  if (!config[NODE_ENV].password && !config[NODE_ENV].privateKey) {
    msg(chalk.redBright('密码或密钥文件'))
    shell.exit()
  }
  if (config[NODE_ENV].password) {
    // 有密码时优先用密码
    const passwordDir = path.resolve(PRESET_PATH, config[NODE_ENV].password) // 密码路径
    console.log('passwordDir=', passwordDir)
    const isExistsPwd = await getStat(passwordDir)
    if (!isExistsPwd) {
      msg(chalk.yellowBright('密码文件' + passwordDir))
      shell.exit()
    }
    config[NODE_ENV].password = fs.readFileSync(passwordDir).toString()
    delete config[NODE_ENV].privateKey
  } else if (config[NODE_ENV].privateKey) {
    // 无密码时用密钥
    const privateKey = path.resolve(PRESET_PATH, config[NODE_ENV].privateKey) // 密钥路径
    const isExistsKey = await getStat(privateKey)
    if (!isExistsKey) {
      msg(chalk.redBright('密钥文件' + privateKey))
      shell.exit()
    }
    config[NODE_ENV].privateKey = fs.readFileSync(privateKey)
  }
  // 检查服务器部署目录是否配置
  if (!config[NODE_ENV].webDir) {
    msg(chalk.redBright('服务器部署路径') + '，请先配置→→' + chalk.yellowBright('webDir'))
    shell.exit()
  }
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 执行打包命令
 * @param {Object} config 配置信息
 * @param {Function} callback 回调函数
 * @return {*}
 * @Date: 2021-05-28 17:43:03
 */
function compileDist(config, callback) {
  console.log('打包前', Date.now())
  const isNpm = config[NODE_ENV].script.match(/npm|npx|cross-env/)
  const distPath = path.join(process.cwd(), config[NODE_ENV].distPath)
  const UNI_OUTPUT_DIR = config[NODE_ENV].isUniApp ? `UNI_OUTPUT_DIR=${distPath} ` : ' ' // uni-app项目可配置自定义打包目录
  const EXEC_CODE = !isNpm ? 'npx cross-env NODE_ENV=production ' + UNI_OUTPUT_DIR + config[NODE_ENV].script : isNpm
  console.log(chalk.redBright('打包命令'), EXEC_CODE)
  const startTime = Date.now()
  if (callback) {
    const process = shell.exec(EXEC_CODE, { async: true })
    // 监听回调
    process.stdout.on('data', (data) => {
      // console.log('data===========', Date.now())
      if (data.match('DONE  Build complete')) {
        callback && callback()
        console.log(
          'uniApp项目打包H5成功，',
          chalk.greenBright('耗时'),
          chalk.magentaBright(Date.now() - startTime),
          'ms'
        )
      }
    })
    process.stderr.on('data', (data) => {
      console.log('stderr: ' + data)
    })
  } else {
    if (shell.exec(EXEC_CODE).code === 0) {
      console.log('打包成功，', chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
    }
  }
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 查看打包目录是否存在
 * @param {String} distPath 路径
 * @param {String} errorName 错误提示
 * @return {*}
 * @Date: 2021-05-28 17:42:40
 */
const findBuildDir = async (distPath, errorName) => {
  const isExists = await getStat(distPath)
  // 如果该路径存在且不是文件，返回true
  if (!isExists || (isExists && !isExists.isDirectory())) {
    msg(chalk.redBright((distPath || errorName) + '目录'))
    shell.exit()
  }
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 打成压缩包
 * @param {Object} config 配置信息
 * @param {String} distPath 路径
 * @return {*}
 * @Date: 2022-06-09 20:25:20
 */
const bulidZip = (config, distPath) => {
  // console.log('distPath===', distPath.match(/dist/), Date.now())
  const startTime = Date.now()
  const nameZip = config[NODE_ENV].nameZip + config[NODE_ENV].zipSuffix
  shell.cd(distPath)
  const gz = `tar -zcf ${nameZip} *`
  if (shell.exec(gz).code === 0) {
    console.log(
      'zip成功',
      chalk.magentaBright(nameZip),
      chalk.greenBright('耗时'),
      chalk.magentaBright(Date.now() - startTime),
      'ms'
    )
    const name = path.resolve(PRESET_PATH, distPath + '/' + nameZip) // 本地打包后的目录
    console.log('name===', name)
    const isExistsZip = fs.existsSync(name)
    // 检测文件是否存在
    if (!isExistsZip) {
      msg(chalk.redBright(name + '目录'))
      shell.exit()
    }
    // return nameZip
  }
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 拼接每天的备份目录
 * @param {Object} config 配置信息
 * @return {*}
 * @Date: 2022-06-23 20:36:53
 */
const dailyDataBackup = async (config) => {
  const today = moment().format('YYYY-MM-DD')
  const dataBackupArr = config[NODE_ENV].dataBackup.split('/').filter((item) => item)
  if (dataBackupArr.length > 1) {
    config[NODE_ENV].dataBackup = config[NODE_ENV].dataBackup + '/' + today
  } else {
    // 无/时拼接服务器目录生成备份目录
    config[NODE_ENV].dataBackup = config[NODE_ENV].webDir + '/' + config[NODE_ENV].dataBackup + '/' + today
  }
  shell.echo('今日备份目录：', chalk.yellowBright(config[NODE_ENV].dataBackup), Date.now())
}
//
/**
 * @author: yiling (315800015@qq.com)
 * @description: 创建服务器上备份目录
 * @param {Object} config 配置信息
 * @param {*} sftp
 * @return {*}
 * @Date: 2022-07-03 22:16:38
 */
function mkDataBackup(config, sftp) {
  const cmd = `mkdir -vp ${config[NODE_ENV].dataBackup}`
  sftp.exec(cmd, (err, SFTP) => {
    if (err) {
      shell.echo(chalk.yellowBright('备份目录创建失败'), cmd, Date.now())
      sftp.end()
    }
    // SFTP.on('data', (data) => {}).on('close', () => {
    //   console.log('备份目录创建完毕', Date.now())
    //   sftp.end()
    // })
  })
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 使用rm遍历删除远程目录
 * @param {Object} config 配置信息
 * @param {*} sftp
 * @return {*}
 * @Date: 2022-06-01 19:54:40
 */
const rmWebDir = async (config, sftp) => {
  const deleteWebDirList = config[NODE_ENV].deleteWebDirList
  // 遍历删除指定目录，防止误删除其他文件
  for (const item of deleteWebDirList) {
    const dir = config[NODE_ENV].webDir + item
    const cmd = `rm -rf ${dir} \n `
    sftp.exec(cmd, (err, SFTP) => {
      if (err) {
        shell.echo(chalk.yellowBright('删除目录失败'), cmd, Date.now())
        sftp.end()
      }
      shell.echo('删除cmd=', cmd, ';===', Date.now())
      // SFTP.on('data', (data) => {
      //   console.log(chalk.yellowBright('执行完毕'), data.toString(), Date.now())
      // }).on('close', () => {
      //   console.log('==========', Date.now())
      //   sftp.end()
      // })
      // sftp.end()
    })
  }
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 解压服务器上的压缩包
 * @param {Object} config 配置信息
 * @param {*} sftp
 * @param {String} name 压缩包名字
 * @param {Number} startTime 开始时间戳
 * @return {*}
 * @Date: 2022-07-03 22:27:04
 */
function unZip(config, sftp, name, startTime) {
  const cmd = `
  cd ${config[NODE_ENV].dataBackup}/
  tar -zxvf ${name} -C ${config[NODE_ENV].webDir}/
  exit`
  // 进入服务器中备份目录
  // 解压上传的压缩包到根目录
  // 退出
  // 方法一
  // sftp.shell((err, SFTP) => {
  //   console.log('err===', err, Date.now())
  //   // SFTP
  //   //   .end(cmd)
  //   //   .on('data', (data) => {
  //   //     if (data.toString().match('exit')) {
  //   //       console.log('---解压完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
  //   //       sftp.end()
  //   //       // console.log('data.toString()', data.toString().match('exit'))
  //   //     }
  //   //   })
  //   //   .on('close', () => {
  //   //     console.log('---解压完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
  //   //     sftp.end()
  //   //   })
  // })
  console.log('cmd===', cmd, Date.now())
  // 方法二
  sftp.exec(cmd, (err, SFTP) => {
    if (err) {
      shell.echo(chalk.yellowBright('解压失败'), cmd, Date.now())
      sftp.end()
    }
    SFTP.on('data', (data) => {}).on('close', () => {
      shell.echo('---解压完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
      playMusic(config.musicDir)
      sftp.end()
    })
  })
}
/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 消息日志
 * @param {String} str 要提示的信息
 * @param {String} otherStr 其他信息
 * @return {*}
 * @Date: 2021-09-25 16:53:58
 */
function msg(str, otherStr = '请检查配置') {
  return shell.echo('没有找到' + str + '，' + otherStr)
}
/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 睡眠
 * @param {Number} ms 时间，毫秒
 * @return {*}
 * @Date: 2021-09-25 16:54:35
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 补全配置参数
 * @param {Object} config 客户自己的配置信息
 * @return {*}
 * @Date: 2022-06-23 15:32:19
 */
const editConfig = (config) => {
  config.musicDir = config.musicDir || defaultConfig.musicDir
  Object.keys(defaultConfig.dev).filter((key) => {
    if (!(key in config[NODE_ENV])) {
      config[NODE_ENV][key] = config[NODE_ENV][key] || defaultConfig.dev[key]
    }
  })
}

module.exports = {
  checkClientConfiguration,
  createdClientConfiguration,
  checkConfigurationItems,
  getVersionInfo,
  clientConfiguration,
  checkPackageJson,
  msg,
  compileDist,
  findBuildDir,
  sleep,
  PRESET_PATH,
  NODE_ENV,
  editConfig,
  bulidZip,
  dailyDataBackup,
  mkDataBackup,
  rmWebDir,
  unZip,
}
