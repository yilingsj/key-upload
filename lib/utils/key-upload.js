#!/usr/bin/env node
/*
 * @Description: 使用密码/钥的方式部署前端代码到服务器
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:55
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-23 20:28:01
 * @FilePath: \keyUpload\utils\key-upload.js
 */
const path = require('path')
const Client = require('ssh2-sftp-client')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const { clientConfiguration, compileDist, findBuildDir, NODE_ENV } = require('./base.js') // 公用方法
const { playMusic } = require('./playMusic.js') // 播放音乐

const config = require(clientConfiguration) // 校验通过后再读取配置信息

/**
 * @author: yiling (315800015@qq.com)
 * @description: 连接ssh
 * @param {*}
 * @return {*}
 * @Date: 2021-05-28 11:10:53
 */
const sftp = new Client()
const connectSSh = async (distPath) => {
  let startTime = null
  sftp
    .connect(config[NODE_ENV])
    .then(async () => {
      console.log('-连接服务器' + chalk.yellowBright('成功'), Date.now())
      if (config[NODE_ENV].isRemoveRemoteFile) {
        const deleteWebDirList = config[NODE_ENV].deleteWebDirList
        // 遍历删除指定目录，防止误删除其他文件
        for (var i = 0; i < deleteWebDirList.length; i++) {
          await deleteWebDir(config[NODE_ENV].webDir + deleteWebDirList[i])
        }
        console.log('-指定目录', deleteWebDirList, chalk.yellowBright('删除完毕'), Date.now())
      }
    })
    .then(() => {
      // 上传文件
      startTime = Date.now()
      console.log('-------开始上传', startTime)
      console.log('-上传时间受包体积、网络等因素影响，请耐心等待。等待过程中' + chalk.yellowBright('请勿中断') + '哦~')
      return sftp.uploadDir(distPath, config[NODE_ENV].webDir)
    })
    .then((data) => {
      if (config[NODE_ENV].autoplayMusic) {
        playMusic(config.musicDir)
      }
      console.log('---上传完成' + chalk.greenBright('耗时'), chalk.magentaBright(Date.now() - startTime), 'ms')
      sftp.end()
    })
    .catch((err) => {
      console.log(err, chalk.redBright('上传失败'), Date.now())
      sftp.end()
    })
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 查看远程目录是否存在
 * @param {String} path 远程路径
 * @return {*}
 * @Date: 2021-05-28 16:47:41
 */
const findWebDir = (path) => {
  return new Promise((resolve) => {
    return sftp
      .exists(path)
      .then((res) => {
        return resolve(res)
      })
      .catch((err) => {
        console.log(chalk.redBright('远程目录出现错误'), err)
      })
  })
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 删除远程目录
 * @param {*}
 * @return {*}
 * @Date: 2021-05-28 16:20:14
 */
const deleteWebDir = (webDir) => {
  return findWebDir(webDir).then((res) => {
    // console.log('deleteWebDir===', res, ';webDir=', webDir, Date.now())
    if (res) {
      return sftp.rmdir(webDir, true)
    }
  })
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 删除远程文件(非文件夹)
 * @param {*}
 * @return {*}
 * @Date: 2021-05-28 16:20:14
 */
const deleteWebPath = (webDir) => {
  return findWebDir(webDir).then((res) => {
    console.log('delete ====', res)
    if (res) {
      return sftp.delete(webDir, true)
    }
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
  await compileDist(config) // 打包完成
  await findBuildDir(distPath, 'distPath') // 查看打包目录是否存在
  await connectSSh(distPath) // 提交上传
}
// 调用
runTask()
