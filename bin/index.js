#!/usr/bin/env node
/*
 * @Description: 入口文件
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:55
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-25 20:57:01
 * @FilePath: \keyUpload\bin\index.js
 */
const shell = require('shelljs')
const path = require('path')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const {
  checkClientConfiguration,
  createdClientConfiguration,
  clientConfiguration,
  getVersionInfo,
  editConfig,
  checkPackageJson,
  checkConfigurationItems,
  NODE_ENV,
} = require('../lib/utils/base.js') // 公用方法

const PRESET_PATH = path.resolve(__dirname, './')

const keyPath = path.join(PRESET_PATH, '../lib/utils/key-upload.js') // 普通方式上传到服务器
const gitPath = path.join(PRESET_PATH, '../lib/utils/git.js') // 上传到git仓库
const zipPath = path.join(PRESET_PATH, '../lib/utils/zip.js') // 上传压缩包到服务器并自动备份和解压(推荐)
const sshPath = path.join(PRESET_PATH, '../lib/utils/ssh.js') // 测试连接服务器

/**
 * @author: yiling (315800015@qq.com)
 * @description: 运行任务
 * @return {*}
 * @Date: 2022-06-23 17:02:58
 */
async function runTask() {
  getVersionInfo() // 输出版本提示信息
  const params = process.argv[2]
  // 如果执行了创建命令，则先检测再根据情况决定是否自动创建
  if (params === 'init') {
    await createdClientConfiguration() // 检查客户端配置文件是否存在，若不存在则尝试自动创建
    return
  }
  await checkClientConfiguration() // 检查客户端配置文件是否存在
  const config = require(clientConfiguration) // 校验通过后再读取配置信息
  await editConfig(config)
  console.log('当前环境=', chalk.greenBright(NODE_ENV), ';配置信息', chalk.yellowBright('config='), config[NODE_ENV])
  await checkPackageJson(config) // 检查配置文件是否存在

  if (params !== 'git') {
    await checkConfigurationItems(config) // 检查配置项
  }
  // console.log('process.argv=', params === undefined)
  // 根据用户输入的命令来执行不同的打包方案
  if (params === 'git') {
    require(gitPath)
  } else if (params === 'zip') {
    require(zipPath)
  } else if (params === 'ssh') {
    require(sshPath)
  } else if (params === undefined) {
    require(keyPath)
  } else {
    shell.echo(
      '未发现命令',
      chalk.redBright(params),
      '，可通过 ' + chalk.greenBright('key-upload -h ') + '查看可使用命令'
    )
    shell.exit()
  }
}

runTask() // 调用
