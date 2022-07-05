#!/usr/bin/env node
/*
 * @Description: 将vue-cli创建的uni-app项目H5端打包部署到服务器
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:55
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-07-05 16:17:20
 * @FilePath: \keyUpload\lib\utils\uni-h5.js
 */
const shell = require('shelljs')
const path = require('path')
const { Client } = require('ssh2')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const {
  clientConfiguration,
  compileDist,
  findBuildDir,
  NODE_ENV,
  bulidZip,
  dailyDataBackup,
  mkDataBackup,
  rmWebDir,
  unZip,
} = require('./base.js') // 公用方法
const config = require(clientConfiguration) // 校验通过后再读取配置信息

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
    mkDataBackup(config, sftp) // 先创建服务器上备份目录
    rmWebDir(config, sftp) // 再删除服务器上的远程目录
    sftp.sftp((err, SFTP) => {
      // 上传文件
      const startTime = Date.now()
      console.log('-------开始上传', startTime)
      console.log('-上传时间受包体积、网络等因素影响，请耐心等待。等待过程中' + chalk.yellowBright('请勿中断') + '哦~')
      if (err) {
        console.log('连接失败===', err, Date.now())
        sftp.end()
      }
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
          unZip(config, sftp, name, startTime)
        })
      }, 1000)
    })
  })
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
  await dailyDataBackup(config) // 生成备份目录
  await compileDist(config, async () => {
    await findBuildDir(distPath, 'distPath') // 查看打包目录是否存在
    await bulidZip(config, distPath)
    await connectSSh(distPath) // 提交上传
  }) // 打包完成
}
// 调用
runTask()
