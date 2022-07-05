#!/usr/bin/env node
/*
 * @Description: 默认配置参数
 * @Author: yiling (315800015@qq.com)
 * @Date: 2022-06-23 11:54:49
 * @LastEditors: yiling (315800015@qq.com)
 * @LastEditTime: 2022-07-05 14:32:22
 * @FilePath: \keyUpload\lib\utils\config.js
 */
const config = {
  name: '一键打包前端代码并部署到Linux服务器',
  musicDir: 'D:\\2021\\music', // 本地音乐目录（项目上传成功后音乐会响起哦~）
  defaultMusicDir: '../music', // 如果本地音乐目录不存在，则默认取自带的音乐
  configPath: 'keyUpload.config.js', // 客户端的配置文件路径
  dev: {
    isRemoveRemoteFile: true, // 是否删除远程文件，受 deleteWebDirList 参数影响 （默认true）
    autoplayMusic: true, // 项目上传成功后是否自动播放音乐（默认true）
    deleteWebDirList: ['/css', '/js', '/static'], // 要删除的远程目录（默认为css|js|static）
    dataBackup: 'dataBackup', // 远程备份目录，如果出现/，则以带/的为主，否则会用 webDir+dataBackup进行拼接（默认dataBackup）
    nameZip: 'dist', // 打成压缩包后的本地文件名，线上的会为dist{time}（默认dist）
    zipSuffix: '.tar.gz', // 压缩包后缀，（默认为：.tar.gz）
    distPath: '/dist/dev', // 本地打包后生成的目录。（Vue项目要跟outputDir保持一致；Vite项目要跟build.outDir保持一致；uni-app项目H5端默认为：/dist/build/h5）
    gitDistPath: '', // 本地git仓库目录，示例: D:\\xxx\\xxx
  },
}

module.exports = config
