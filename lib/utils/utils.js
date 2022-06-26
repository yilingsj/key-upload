/*
 * @Description: 路径相关的一些方法
 * @Author: yilingsj（315800015@qq.com）
 * @Date: 2021-05-01 11:34:10
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-23 15:13:57
 */
var path = require('path')
var fs = require('fs')
const shell = require('shelljs')
const defaultConfig = require('./config.js') // 默认配置参数
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const PRESET_PATH = path.resolve(__dirname, './')

/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 判断路径是否存在
 * @param {string} path 路径
 * @return {*}
 * @Date: 2021-05-01 11:34:40
 */
function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false)
      } else {
        resolve(stats)
      }
    })
  })
}

/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 创建目录
 * @param {String} dir 路径
 * @return {*}
 * @Date: 2021-05-01 11:35:26
 */
function mkdir(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * @author: yilingsj（315800015@qq.com）
 * @description: 路径是否存在，不存在则创建
 * @param {String} dir 路径
 * @return {*}
 * @Date: 2021-05-01 11:37:01
 */
async function dirExists(dir) {
  const isExists = await getStat(dir)
  // 如果该路径且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) {
    // 如果该路径存在但是文件，返回false
    return false
  }
  // 如果该路径不存在
  const tempDir = path.parse(dir).dir // 拿到上级路径
  // 递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  const status = await dirExists(tempDir)
  let mkdirStatus
  if (status) {
    mkdirStatus = await mkdir(dir)
  }
  return mkdirStatus
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 读取文件夹下所有的文件
 * @param {String} dirPath 路径
 * @param {Array} filesList 存储的数组
 * @return {*}
 * @Date: 2021-09-18 13:55:54
 */
async function readFileList(dirPath, filesList = []) {
  const isExists = await getStat(dirPath)
  let dir = dirPath
  if (!isExists) {
    shell.echo('没有找到音乐目录：' + chalk.redBright(dirPath) + '，即将播放内置音乐')
    dir = path.resolve(PRESET_PATH, defaultConfig.defaultMusicDir) // 重置音乐路径为内置路径
    // shell.exit()
    // return
  }
  const files = fs.readdirSync(dir)
  console.log('文件名：', files)
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) // 递归读取文件
    } else {
      filesList.push(fullPath)
    }
  })
  // console.log('铃声列表：', filesList)
  return filesList
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 取两个数之间的随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @return {*}
 * @Date: 2021-09-18 14:05:34
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}
module.exports = { getStat, dirExists, readFileList, getRandomNumber }
