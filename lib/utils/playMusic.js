#!/usr/bin/env node
/*
 * @Description: 播放音乐
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-09-18 14:11:01
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-23 18:16:33
 * @FilePath: \keyUpload\utils\playMusic.js
 */
const chalk = require('chalk') // 引入颜色插件
const open = require('open')
const { readFileList, getRandomNumber } = require('./utils.js')

/**
 * @author: yiling (315800015@qq.com)
 * @description: 获取音乐
 * @param {String} dir 本地音乐目录
 * @return {*}
 * @Date: 2021-09-18 14:12:16
 */
async function getMusic(dir) {
  const musicList = await readFileList(dir)
  const index = getRandomNumber(0, musicList.length)
  const src = musicList[index]
  const name = src.substr(src.lastIndexOf('\\')).replace('\\', '')
  console.log('当前播放的铃声是：', chalk.greenBright(name))
  return src
}
/**
 * @author: yiling (315800015@qq.com)
 * @description: 播放音乐
 * @param {String} dir 本地音乐目录
 * @return {*}
 * @Date: 2021-09-18 14:13:13
 */
async function playMusic(dir) {
  const src = await getMusic(dir)
  await open(src)
}

// playMusic()

module.exports = { playMusic }
