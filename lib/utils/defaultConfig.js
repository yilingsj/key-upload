#!/usr/bin/env node
/*
 * @Description: 一键部署代码到服务器上的配置
 * @Author: yiling (315800015@qq.com)
 * @Date: 2021-05-27 21:13:59
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-06-25 17:47:57
 * @FilePath: \keyUpload\utils\defaultConfig.js
 */

// 公用配置，注释的内容无特殊需求可不用配置
const commonBase = {
  host: 'xx.x.x.x', // 服务器地址
  port: 22, // 服务器端口号
  username: 'root', // 服务器登录用户名
  password: 'D:\\xx\\xx\\xxx.txt', // 服务器登录密码路径，支持相对或绝对地址，优先使用密码。注意这里是密码文件！
  privateKey: 'D:\\xxx\\xxx\\xxx.pem', // 密钥地址，与密码二选一均可
  // isRemoveRemoteFile: true, // 是否删除远程文件，受 deleteWebDirList 参数影响 （默认true）
  // autoplayMusic: true, // 项目上传成功后是否自动播放音乐（默认true）
  // deleteWebDirList: ['/css', '/js', '/static'], // 要删除的远程目录（默认为css|js|static）
  // dataBackup: 'dataBackup', // 远程备份目录，如果出现/，则以带/的为主，否则会用 webDir+dataBackup进行拼接（默认dataBackup）
  // nameZip: 'dist', // 打成压缩包后的本地文件名，线上的会为dist{time}（默认dist）
  // zipSuffix: '.tar.gz', // 压缩包后缀（默认为：.tar.gz）
  // gitDistPath: '', // 本地git仓库目录，示例: D:\\xxx\\xxx
}
const config = {
  name: '一键打包前端代码并部署到Linux服务器',
  // musicDir: 'D:\\2021\\music', // 本地音乐目录（项目上传成功后音乐会响起哦~）
  dev: {
    ...commonBase,
    name: '开发环境', // 环境名称
    distPath: '/dist/dev', // 本地打包生成目录
    webDir: '/data/website/dev', // 服务器部署路径（不可为空或'/'）
    script: 'build:dev', // 打包命令
  },
  test: {
    ...commonBase,
    name: '测试环境', // 环境名称
    distPath: '/dist/test', // 本地打包生成目录
    webDir: '/data/website/test', // 服务器部署路径（不可为空或'/'）
    script: 'build:test', // 打包命令
  },
  pre: {
    ...commonBase,
    name: '预上线环境',
    distPath: '/dist/preshopv5',
    webDir: '/data/website/pre',
    script: 'build:pre',
  },
  prod: {
    ...commonBase,
    host: 'xxx.xxx.xxx.xxx', // 新的服务器地址
    password: '', // 密码为空时，则用密钥来连接服务器
    name: '正式环境', // 环境名称
    distPath: '/dist/production', // 本地打包生成目录
    webDir: '/data/website/prod', // 服务器部署路径（不可为空或'/'）
    script: 'build:prod', // 打包命令
  },
}

module.exports = config
