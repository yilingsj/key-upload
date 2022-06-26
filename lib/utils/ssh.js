#!/usr/bin/env node
/*
 * @Description: 测试连接服务器
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:55
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-26 10:18:47
 * @FilePath: \keyUpload\lib\utils\ssh.js
 */
const Client = require('ssh2-sftp-client')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const { clientConfiguration, NODE_ENV } = require('./base.js') // 公用方法

const config = require(clientConfiguration) // 校验通过后再读取配置信息

/**
 * @author: yiling (315800015@qq.com)
 * @description: 连接ssh
 * @param {*}
 * @return {*}
 * @Date: 2021-05-28 11:10:53
 */
const sftp = new Client()
const connectSSh = async () => {
  sftp
    .connect(config[NODE_ENV])
    .then(async () => {
      console.log('-连接服务器' + chalk.yellowBright('成功'), Date.now())
    })
    .then(() => {})
    .then(() => {
      sftp.end()
    })
    .catch((err) => {
      console.log(err, chalk.redBright('连接失败'), Date.now())
      sftp.end()
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
  await connectSSh() // 连接ssh
}
// 调用
runTask()
