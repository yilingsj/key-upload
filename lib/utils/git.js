#!/usr/bin/env node
/*
 * @Description: 上传到git仓库
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-09-26 10:44:02
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-25 19:34:49
 * @FilePath: \keyUpload\utils\git.js
 */
const shell = require('shelljs')
const path = require('path')
const chalk = require('chalk') // 引入颜色插件
chalk.level = 2 // 不设置的话不会变色
const defaultConfig = require('./config.js') // 默认配置参数
const { clientConfiguration, compileDist, findBuildDir, NODE_ENV } = require('./base.js') // 公用方法
const { playMusic } = require('./playMusic.js') // 播放音乐

// 相关命令
const command = {
  status: 'git status', // 查看仓库当前状态
  add: 'git add .', // 把本地有修改的文件加入暂存区
  commit: 'git commit -m', // 将暂存区的内容添加到仓库中
  pull: 'git pull', // 拉取代码
  push: 'git push', // 上传远程代码并合并
  branch: 'git branch', // 查看当前分支
  branchR: 'git branch -r', // 查看远程所有分支
  branchA: 'git branch -a', // 查看本地和远程所有分支
}

const config = require(clientConfiguration) // 校验通过后再读取配置信息

/**
 * @author: yiling (315800015@qq.com)
 * @description: 遍历删除指定目录（上次提交的文件）
 * @param {Array} dirList 要删除的目录列表
 * @return {*}
 * @Date: 2021-10-11 10:37:24
 */
async function deleteDir(dirList, gitDistPath) {
  if (!dirList.length) {
    shell.echo('未找到要删除的目录列表')
    shell.exit()
  }
  const deleteTime = Date.now()
  dirList.map((name) => {
    const dir = path.resolve(gitDistPath, './' + name)
    console.log('dir=', dir)
    const rm = shell.rm('-rf', dir) // 强制删除（敏感操作，禁止使用）
    // console.log('after', rm, Date.now())
  })
  shell.echo('删除目录耗时：' + chalk.magentaBright(Date.now() - deleteTime) + 'ms')
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 复制打包后的文件到新仓库目录中
 * @param {String} distPath 本地打包后的目录
 * @param {String} gitDistPath 本地git仓库目录
 * @return {*}
 * @Date: 2021-10-11 10:38:07
 */
async function copyDir(distPath, gitDistPath) {
  const copyTime = Date.now()
  const cp = shell.cp('-R', distPath + '/*', gitDistPath) // 复制文件
  // console.log('after', cp, Date.now())
  if (cp.code !== 0) {
    shell.echo('复制失败')
    shell.exit()
  }
  shell.echo('复制成功，耗时：' + chalk.magentaBright(Date.now() - copyTime) + 'ms')
}
var version = shell.exec('node --version').stdout
let remark = process.argv[2] || '[update]发一版' // git commit 的备注
if (process.argv.length > 2) {
  remark = process.argv[process.argv.length - 1]
}
console.log('version===', version, Date.now(), ';remark===', remark)

/**
 * @author: yiling (315800015@qq.com)
 * @description: 拉取代码
 * @param {*}
 * @return {*}
 * @Date: 2021-10-11 10:48:25
 */
async function gitPull(gitDistPath) {
  shell.cd(gitDistPath) // 进入目录
  shell.echo('拉取前', Date.now())
  if (shell.exec(command.pull).code !== 0) {
    shell.echo('拉取失败', Date.now())
    shell.exit()
  }
  console.log('拉取后', Date.now())
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 查看仓库当前状态
 * @param {*}
 * @return {*}
 * @Date: 2021-10-11 10:50:40
 */
async function gitStatus() {
  const infoStatus = shell.exec(command.status)
  if (infoStatus.code !== 0) {
    shell.echo('git status failed', Date.now())
    shell.exit()
  }
  const noCommit = infoStatus.stdout.match(/nothing to commit/) // 判断是否有新内容需要提交
  const re = infoStatus.stdout.match(/^On branch (.+)\s/) // 查看当前修改的内容在哪个分支

  console.log('infoStatus.stdout=', infoStatus.stdout, Date.now())
  console.log('当前分支：', chalk.yellowBright(re[1]), Date.now())

  const branchRStr = shell.exec(command.branchR).stdout
  // console.log('branchRStr===', branchRStr, Date.now(), ';branchRStr.match(re[1])=', branchRStr.match(re[1]))
  if (!branchRStr.match(re[1])) {
    shell.echo('当前分支未曾提交到线上', Date.now())
    command.push = command.push + ' --set-upstream origin ' + re[1]
  }

  if (noCommit) {
    shell.echo('当前暂无要提交的代码', Date.now())
    shell.exit()
  }
  console.log('git status 成功', Date.now())
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 把本地有修改的文件加入暂存区
 * @param {*}
 * @return {*}
 * @Date: 2021-10-11 10:52:28
 */
async function gitAdd() {
  const infoAdd = shell.exec(command.add)
  if (infoAdd.code !== 0) {
    shell.echo('git add failed', Date.now())
    shell.exit()
  }
  console.log('git add 成功', Date.now())
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 将暂存区的内容添加到仓库中
 * @param {*}
 * @return {*}
 * @Date: 2021-10-11 10:52:39
 */
async function gitCommit() {
  console.log('git commit 前', Date.now())
  const infoCommit = shell.exec(command.commit + remark)
  if (infoCommit.code !== 0) {
    shell.echo('git commit failed', Date.now())
    shell.exit()
  }
  console.log('git commit 成功', Date.now())
}

/**
 * @author: yiling (315800015@qq.com)
 * @description: 上传远程代码并合并
 * @param {*}
 * @return {*}
 * @Date: 2021-10-11 10:54:12
 */
async function gitPush() {
  // console.log('git push 前', Date.now())
  const infoPush = shell.exec(command.push)
  // console.log(';info.push=>>>>>>>', infoPush, ';command.push=', command.push)
  if (infoPush.code !== 0) {
    shell.echo('git push', chalk.yellowBright('失败'), Date.now())
    shell.exit()
  }
  if (config[NODE_ENV].autoplayMusic) {
    playMusic(defaultConfig.musicDir)
  }
  console.log('git push', chalk.yellowBright('成功'), Date.now())
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
  const gitDistPath = config[NODE_ENV].gitDistPath
  console.log('当前环境=', chalk.greenBright(NODE_ENV), ';配置信息', chalk.yellowBright('config='), config[NODE_ENV])
  await findBuildDir(gitDistPath, 'gitDistPath') // 查看仓库目录是否存在
  await deleteDir(config[NODE_ENV].deleteWebDirList, gitDistPath) // 删除仓库目录下的指定文件
  await compileDist(config) // 打包完成
  await findBuildDir(distPath, 'distPath') // 查看打包目录是否存在
  await gitPull(gitDistPath) // 拉代码
  await copyDir(distPath, gitDistPath) // 复制打包目录到仓库
  await gitStatus() // 查看仓库当前状态
  await gitAdd() // 把本地有修改的文件加入暂存区
  await gitCommit() // 将暂存区的内容添加到仓库中
  await gitPush() // 上传远程代码并合并
}
// 调用
runTask()
