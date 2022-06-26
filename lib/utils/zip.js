#!/usr/bin/env node
/*
 * @Description: 生成压缩包上传到服务器后进行备份和解压
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:55
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-25 19:35:59
 * @FilePath: \keyUpload\utils\zip.js
 */
const shell = require('shelljs')
const path = require('path')
// const Client = require('ssh2-sftp-client') // 官方文档中未发现支持shell的写法,所以上传压缩包后无法解压
const { Client } = require('ssh2')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const { clientConfiguration, compileDist, findBuildDir, NODE_ENV, bulidZip } = require('./base.js') // 公用方法
const { playMusic } = require('./playMusic.js') // 播放音乐
const moment = require('dayjs')
const config = require(clientConfiguration) // 校验通过后再读取配置信息

/**
 * @author: yiling (315800015@qq.com)
 * @description: 创建服务器上的备份目录
 * @return {*}
 * @Date: 2022-06-23 20:36:53
 */
const createdDataBackup = async () => {
  // 拼接每天的备份目录
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

/**
 * @author: yiling (315800015@qq.com)
 * @description: 连接ssh // https://www.npmjs.com/package/ssh2
 * @param {*}
 * @return {*}
 * @Date: 2021-05-28 11:10:53
 */
const sftp = new Client()
const connectSSh = async (distPath) => {
  sftp.connect(config[NODE_ENV]).on('ready', () => {
    console.log('连接成功', Date.now())
    mkDataBackup() // 先创建服务器上备份目录
    rmWebDir(sftp) // 先删除服务器上的远程目录
    // console.log('删除完毕;===', Date.now())
    sftp.sftp((err, SFTP) => {
      // 上传文件
      const startTime = Date.now()
      console.log('-------开始上传', startTime)
      console.log('-上传时间受包体积、网络等因素影响，请耐心等待。等待过程中' + chalk.yellowBright('请勿中断') + '哦~')
      if (err) {
        console.log('连接失败===', err, Date.now())
        sftp.end()
      }
      // https://github.com/mscdex/ssh2/blob/master/SFTP.md
      // 读取一个目录↓↓↓
      // SFTP.readdir(config[NODE_ENV].dataBackup, (err, list) => {
      //   if (err) {
      //     // SFTP.mkdir(config[NODE_ENV].dataBackup, true, (err2, list2) => {
      //     //   if (err2) {
      //     //     console.log('创建失败', Date.now())
      //     //   }
      //     //   console.log('li5555555st==', list2, Date.now())
      //     //   sftp.end()
      //     // })
      //     mkDataBackup() // 会报错，直接放外面则不会
      //   }
      //   console.log('li5555555st==', list, Date.now())
      //   sftp.end()
      // })

      // 删除空目录,如果有子内容会失败
      // SFTP.rmdir('css', (err, list) => {
      //   console.log('err===', err, 'list=', list, Date.now())
      //   if (err) {
      //     console.log(chalk.yellowBright('删除目录失败'))
      //     sftp.end()
      //   }
      //   // console.log('list==', list)
      //   sftp.end()
      // })

      const zip = distPath + '/' + config[NODE_ENV].nameZip + config[NODE_ENV].zipSuffix // 本地压缩包地址
      const name = config[NODE_ENV].nameZip + Date.now() + config[NODE_ENV].zipSuffix
      const webZip = config[NODE_ENV].dataBackup + '/' + name // 线上备份
      // 延时一秒，防止意外报错（目录未创建完会报错）
      setTimeout(() => {
        SFTP.fastPut(zip, webZip, {}, (err) => {
          if (err) {
            console.log('fastPut失败===', err, ';webZip=', webZip, Date.now())
            sftp.end()
          }
          // 上传完成后开始解压
          unZip(sftp, name, startTime)
        })
      }, 1000)
    })
    // sftp.shell((err, SFTP) => {
    //   console.log('外err=', err, ';===', Date.now())
    // })
  })
}

// 解压服务器上的压缩包
function unZip(conn, name, startTime) {
  // rm -rf dist.tar.gz // 慎用!!!
  const cmd = `
  cd ${config[NODE_ENV].dataBackup}/
  tar -zxvf ${name} -C ${config[NODE_ENV].webDir}/
  exit`
  // 进入服务器中备份目录
  // 解压上传的压缩包到根目录
  // 退出
  // 方法一
  // conn.shell((err, SFTP) => {
  //   console.log('err===', err, Date.now())
  //   // SFTP
  //   //   .end(cmd)
  //   //   .on('data', (data) => {
  //   //     if (data.toString().match('exit')) {
  //   //       console.log('---解压完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
  //   //       conn.end()
  //   //       // console.log('data.toString()', data.toString().match('exit'))
  //   //     }
  //   //   })
  //   //   .on('close', () => {
  //   //     console.log('---解压完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
  //   //     conn.end()
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
// 创建服务器上备份目录
function mkDataBackup() {
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
 * @param {*} sftp
 * @return {*}
 * @Date: 2022-06-01 19:54:40
 */
const rmWebDir = async (sftp) => {
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
 * @author: yilingsj（315800015@qq.com）
 * @description: 运行任务
 * @param {*}
 * @return {*}
 * @Date: 2021-09-25 09:47:15
 */
async function runTask() {
  const distPath = path.join(process.cwd(), config[NODE_ENV].distPath) // 本地打包后的目录
  await createdDataBackup() // 生成备份目录
  await compileDist(config) // 打包完成
  await findBuildDir(distPath, 'distPath') // 查看打包目录是否存在
  await bulidZip(config, distPath)
  await connectSSh(distPath) // 提交上传
}
// 调用
runTask()
