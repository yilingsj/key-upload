# key-upload v0.1.5
一键打包前端代码并部署到Linux服务器。支持密码文件/密钥登录，支持压缩、解压、备份服务器目录功能，支持代码同步到git仓库。

# github仓库↓↓↓
[https://github.com/yilingsj/key-upload.git](https://github.com/yilingsj/key-upload.git)

# npm仓库↓↓↓
[https://www.npmjs.com/package/key-upload](https://www.npmjs.com/package/key-upload)

# 更新日志
在文档最后

# 插件背景
起因是公司项目太多，且每个项目有4套环境，上线前的分支合并和打包这种琐事儿都是由我亲自经手。为了**解决频繁打包**、漫长的**等待打包完成**和手动**上传代码到服务器**、手动复制正式代码到**git仓库并上传**，这一系列重复且低效的工作量，于是我开始积极寻找解决方案。试用过`deploy-cli-service`这个插件，经测试发现跟自己的需求相差较大。无果之下，自己开启造轮子之旅。目前公司的项目全使用的是我的脚本。

大半年过去了，总体来说还是比较满意的。现将脚本做成npm包并分享出来，有需要的看官记得点个star哦！

## 支持的项目
由于工作环境所限，目前仅测试了 **vue2项目**(非ts)、**vue3项目**(非ts)、**Vite项目**(非ts)，**uni-app vue2项目**，**uni-app Vue3/Vite项目**，其他项目未做测试。理论上是通用的。

## 已实现的功能
- 一键打包前端代码到Linux服务器(目前支持4个环境，分别是：dev:开发环境, test:测试环境, pre:预上线环境, prod:正式环境)
- 支持密码文件登录（为了避免密码轻易泄露，此处必须是密码文件！就是将密码保存磁盘上的一个txt文件中，这样就降低了在分享仓库时泄露明文密码的风险。）
- 支持密钥登录
- 打包成功后自动连接服务器
- 连接服务器后自动删除服务器上指定目录(js|css|static)（可选）
- 删除完毕后自动上传本地代码到服务器（可选）
- 自动将代码打包成压缩包(dist.tar.gz)后上传到服务器（可选，推荐用压缩包，因为上传速度快！！！）
- 自动以YYYY-MM-DD的形式创建备份目录和解压代码（可选）
- 自动上传本地代码到git仓库（可选）
- 上传成功后自动播放一首随机音乐（可选）
- 支持用vue-cli命令行创建的uni-app项目(Vue3/Vite版)打包h5端代码到服务器（0.1.3已支持）
- 支持用vue-cli命令行创建的uni-app项目(Vue2版)打包h5端代码到服务器（0.1.4）
- 支持用vue-cli命令行创建的uni-app项目在**H5端自定义打包**目录（0.1.5） ![uni-app项目H5端可自定义打包目录.png](https://img.alicdn.com/imgextra/i1/759415648/O1CN01xvLHYh1rapk8yhwSD_!!759415648.png)

## node版本
推荐以下`node`版本，因为我们前端组就是这套。
```
node -v 14.16.0
npm -v 6.14.11
```

## 下载安装
```
npm install key-upload --save-dev // 项目内安装
npm install key-upload -g // 全局安装
```
### 查看帮助
在`cmd`或`Git Bash Here`中执行以下命令
#### 1.全局安装时
```
key-upload -V // 查看当前版本号
key-upload -h // 查看可使用的命令
```
![全局安装](https://img.alicdn.com/imgextra/i1/759415648/O1CN01oFQ7TJ1rapkGDAhkT_!!759415648.png)

#### 2.项目内安装时，需要在前面加`npx`
```
npx key-upload -V // 查看当前版本号
npx key-upload -h // 查看可使用的命令
```
![项目内安装](https://img.alicdn.com/imgextra/i4/759415648/O1CN01lPz48u1rapkFLd6lU_!!759415648.png)

### 配置package.json中的scripts
```
/* vite项目，复制代码start ↓↓↓ */
"build:dev": "vite build --mode development",// 打包开发环境
"build:test": "vite build --mode test",      // 打包测试环境
"build:pre": "vite build --mode preshopv5",  // 打包预上线环境
"build:prod": "vite build",                  // 打包正式环境
/* vite项目，复制代码end ↑↑↑ */

/* vue2项目，复制代码start ↓↓↓ */
"build:dev": "vue-cli-service build --mode development",   // 打包开发环境
"build:pre": "vue-cli-service build --mode preshopv5",     // 打包测试环境
"build:test": "vue-cli-service build --mode test",         // 打包预上线环境
"build:prod": "vue-cli-service build",                     // 打包正式环境
/* vue2项目，复制代码end ↑↑↑ */

/* cli脚手架搭建的uni-app项目，复制代码start ↓↓↓ */
"build:dev": "vue-cli-service build --mode development",   // 打包开发环境
"build:pre": "vue-cli-service build --mode preshopv5",     // 打包测试环境
"build:test": "vue-cli-service build --mode test",         // 打包预上线环境
"build:prod": "vue-cli-service build",                     // 打包正式环境
/* cli脚手架搭建的uni-app项目，复制代码end ↑↑↑ */


/* 以下命令会正常打包项目并上传到服务器上 */
"key-upload:dev": "cross-env NODE_ENV=dev key-upload",    // 打包开发环境并上传到服务器
"key-upload:test": "cross-env NODE_ENV=test key-upload",  // 打包测试环境并上传到服务器
"key-upload:pre": "cross-env NODE_ENV=pre key-upload",    // 打包预上线环境并上传到服务器
"key-upload:prod": "cross-env NODE_ENV=prod key-upload",  // 打包正式环境并上传到服务器

/* 以下命令会正常打包项目并上传到git仓库上，【可不用配置】 */
"key-upload:prod:git": "cross-env NODE_ENV=prod key-upload git", // 如果想把代码上传到某git仓库，只需要在后面带上 git即可

/* 以下命令会打包成压缩包并上传到服务器上，【可不用配置】 */
"key-upload:dev:zip": "cross-env NODE_ENV=dev key-upload zip",   // 打包开发环境为压缩包并上传到服务器
"key-upload:test:zip": "cross-env NODE_ENV=test key-upload zip", // 打包测试环境为压缩包并上传到服务器
"key-upload:pre:zip": "cross-env NODE_ENV=pre key-upload zip",   // 打包预上线环境为压缩包并上传到服务器
"key-upload:prod:zip": "cross-env NODE_ENV=prod key-upload zip", // 打包正式环境为压缩包并上传到服务器
```
#### 友情提示：
如果觉得配置 `git` 和 `zip` 麻烦，可以**不用配置**，只需要在执行命令时，在最后面加上**英文空格 + git或zip**即可。
```
npm run key-upload:dev:git  等同于 npm run key-upload:dev git
npm run key-upload:dev:zip  等同于 npm run key-upload:dev zip
```
### 创建配置文件 keyUpload.config.js
#### 用命令创建（推荐）
在项目根目录下打开`cmd`或`Git Bash Here`，输入以下命令并回车即可。

```
key-upload init // 全局安装时
npx key-upload init // 项目内安装时要加npx

/* 若是vue-cli创建的uni-app项目，建议使用下面的命令↓↓↓ */
key-upload initUniH5 // 全局安装时
npx key-upload initUniH5 // 项目内安装时要加npx
```
![在项目内创建配置文件](https://img.alicdn.com/imgextra/i4/759415648/O1CN016O1AUC1rapk4GTBcR_!!759415648.png)

当出现“默认配置文件 `keyUpload.config.js` **已创建成功**”字样时，表明创建成功。
如果出现“默认配置文件 `keyUpload.config.js` **已存在**”字样时，表明配置文件已存在，此时不需要重新创建。如果想重新创建，删除本地的 `keyUpload.config.js` 即可。
接下来看官只需要修改对应环境的一些配置信息即可。例如：`host`、`password`、`webDir`等

#### 手动创建
如果用上面的命令创建失败，看官还可以使用手动来创建配置文件。先在**项目根目录**中创建一个名为 `keyUpload.config.js` 的文件，接着复制下方代码后粘贴进去即可。示例代码如下：
```
#!/usr/bin/env node
// 公用配置，注释的内容无特殊需求可不用配置
const commonBase = {
  host: 'xx.x.x.x', // 服务器地址
  port: 22, // 服务器端口号
  username: 'root', // 服务器登录用户名
  password: 'D:\\xx\\xx\\xxx.txt', // 服务器登录密码路径，支持相对或绝对地址，优先使用密码
  privateKey: 'D:\\xxx\\xxx\\xxx.pem', // 密钥地址，与密码二选一均可
  // isRemoveRemoteFile: true, // 是否删除远程文件（默认true）
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
    distPath: '/dist/dev', // 本地打包后生成的目录。（Vue项目要跟outputDir保持一致；Vite项目要跟build.outDir保持一致；uni-app项目H5端默认为：/dist/build/h5）
    webDir: '/data/website/dev', // 服务器部署路径（不可为空或'/'）
    script: 'build:dev', // 打包命令，要在 /package.json 中的 scripts 内事先定义
  },
  test: {
    ...commonBase,
    name: '测试环境', // 环境名称
    distPath: '/dist/test', // 本地打包后生成的目录
    webDir: '/data/website/test', // 服务器部署路径（不可为空或'/'）
    script: 'build:test', // 打包命令
  },
  pre: {
    ...commonBase,
    name: '预上线环境',
    distPath: '/dist/pre', // 本地打包后生成的目录
    webDir: '/data/website/pre',
    script: 'build:pre',
  },
  prod: {
    ...commonBase,
    host: 'xxx.xxx.xxx.xxx', // 新的服务器地址
    password: '', // 密码为空时，则用密钥来连接服务器
    name: '正式环境', // 环境名称
    distPath: '/dist/prod', // 本地打包后生成的目录
    webDir: '/data/website/prod', // 服务器部署路径（不可为空或'/'）
    script: 'build:prod', // 打包命令
  },
}

module.exports = config

```

如果看官想了解更多参数，可看下方文档↓↓↓

#### 参数配置
| 参数     |                         说明                          |  类型  | 必填  |                          默认值                          | 可选值 |
| -------- | :---------------------------------------------------: | :----: | :---: | :------------------------------------------------------: | -----: |
| name     |                         标题                          | String |  否   |           一键打包前端代码并部署到Linux服务器            |      - |
| musicDir | 本地音乐目录（项目上传成功后自动随机播放一首音乐哦~） | String |  否   | D:\\\2021\\\music  （注意：windows系统上是**双反**斜线） |      - |
| dev      |                       开发环境                        | Object |  否   |                 见下方的“各环境配置参数”                 |      - |
| test     |                       测试环境                        | Object |  否   |                 见下方的“各环境配置参数”                 |      - |
| pre      |                      预上线环境                       | Object |  否   |                 见下方的“各环境配置参数”                 |      - |
| prod     |                       正式环境                        | Object |  否   |                 见下方的“各环境配置参数”                 |      - |

友情提醒，请根据项目实际情况来配置`dev`、`test`、`pre`、`prod`。

#### 各环境参数配置(dev|test|pre|prod)

| 参数               |                                                                                                        说明                                                                                                         |  类型   | 必填  |                           默认值                            |                                              可选值 |
| ------------------ | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----: | :---: | :---------------------------------------------------------: | --------------------------------------------------: |
| host               |                                                                                                    服务器ip地址                                                                                                     | String  |  是   |                              -                              |                                                   - |
| port               |                                                                                                       端口号                                                                                                        | String  |  是   |                             22                              |                                                   - |
| username           |                                                                                                     登录用户名                                                                                                      | String  |  是   |                            root                             |                                                   - |
| password           |                                                 服务器登录密码路径，支持相对或绝对地址，优先使用密码登录。若密码未设置，则尝试用密钥登录。（与**密钥二选一**均可）                                                  | String  |  是   | D:\\\xx\\\xx\\\xxx.txt（注意：windows系统上是**双反**斜线） |                                                   - |
| privateKey         |                                                                                          密钥地址，与**密码二选一**均可。                                                                                           | String  |  是   |   D:\\\xxx\\\xxx.pem（注意：windows系统上是**双反**斜线）   |                                                   - |
| distPath           | 本地打包后生成的目录。Vue项目要跟`outputDir`保持一致；Vite项目要跟`build.outDir`保持一致。<br>由于`vue-cli`创建的`uni-app`项目暂不支持`outputDir`，所以`distPath`会直接影响H5端的打包路径，默认为`/dist/build/h5`。 | String  |  是   |                          /dist/dev                          |                   /dist/test、/dist/pre、/dist/prod |
| webDir             |                                                                                           服务器部署路径（不可为空或'/'）                                                                                           | String  |  是   |                      /data/website/dev                      |                                                   - |
| script             |                                                                                打包命令，要在`/package.json`中的`scripts`内事先定义                                                                                 | String  |  是   |                          build:dev                          |                   build:test、build:pre、build:prod |
| name               |                                                                                                      环境名称                                                                                                       | String  |  否   |                          开发环境                           |                      测试环境、预上线环境、正式环境 |
| isRemoveRemoteFile |                                                                                   是否删除远程文件，受`deleteWebDirList`参数影响                                                                                    | Boolean |  否   |                            true                             |                                               false |
| autoplayMusic      |                                                                                           项目上传成功后是否自动播放音乐                                                                                            | Boolean |  否   |                            true                             |                                               false |
| deleteWebDirList   |                                                                                                  要删除的远程目录                                                                                                   |  Array  |  否   |                 ['/css', '/js', '/static']                  |                                                   - |
| dataBackup         |                                                                     远程备份目录，如果出现/，则以带/的为主，否则会用 webDir+dataBackup进行拼接                                                                      | String  |  否   |                         dataBackup                          |                                                   - |
| nameZip            |                                                                                   打成压缩包后的本地文件名，线上的会为dist{time}                                                                                    | String  |  否   |                            dist                             |                                                   - |
| zipSuffix          |                                                                                                     压缩包后缀                                                                                                      | String  |  否   |                           .tar.gz                           |                                                   - |
| gitDistPath        |                                                                                                   本地git仓库目录                                                                                                   | String  |  否   |                              -                              | D:\\\xxx\\\xxx（注意：windows系统上是**双反**斜线） |

再次提醒，虽然`password`密码文件和`privateKey`密钥文件必填为是，但**只需**要设置一个，否则**无法连接**服务器！！！

### 测试上传功能
对本地的**keyUpload.config.js**做完对应的修改后，可以测试能否成功连接服务器。
在项目根目录中打开`cmd`或`Git Bash Here`，输入以下命令并回车。
```
npm run key-upload:dev ssh   // 测试[开发]服务器连接情况
npm run key-upload:prod ssh  // 测试[正式]服务器连接情况
```
![测试连接服务器](https://img.alicdn.com/imgextra/i1/759415648/O1CN01j9ffkM1rapk1yroa0_!!759415648.png)

当出现**连接服务器成功**字样时，表示连接成功。

- 打包开发环境到服务器
```
npm run key-upload:dev:zip // 输入后回车
npm run key-upload:dev zip // 或者这样
npm run key-upload:dev uniH5 // vue-cli创建的uni-app项目(Vue2版)H5端
```
![一键打包并上传](https://img.alicdn.com/imgextra/i4/759415648/O1CN01m8jh7U1rapkBHWX4V_!!759415648.png)

![上传成功后自动播放音乐](https://img.alicdn.com/imgextra/i2/759415648/O1CN01qO1TDL1rapkE7vCXv_!!759415648.png)

稍等片刻，当音乐响起时，则为成功哦！若有报错，注意看`cmd`或`Git Bash Here`窗口中的信息。

#### 友情提醒：数据无价
为了避免看官误操作，导致线上项目无法正常运行的情况发生，建议看官先修改以下**3**处配置进行练手（强烈建议看官在**非正式**环境下先做测试）。
- 修改 `webDir` (ps:服务器部署路径)
强烈建议各位看官把**webDir**设置为一个与**正式项目无关**的目录，然后再执行`npm run key-upload:dev zip` 观察整个打包流程。当音乐响起时，登录服务器看下对应的目录中是否会出现 `dataBackup/YYYY-MM-DD/`（备份目录）、`css|js|static`（项目目录）
- 修改 `deleteWebDirList` (ps:要删除的远程目录)
默认只删除`js`、`css`和`static`这3个目录，如果看官有更多需求，可以通过传递自定义目录来实现删除更多目录
- 修改 `isRemoveRemoteFile` (ps:是否删除远程文件)
将`isRemoveRemoteFile`的值设置为`false`，即可禁用删除功能


#### 版本日志↓↓↓

##### 0.1.5
- 若是`uni-app`项目，建议使用`initUniH5`来创建配置文件。调用方法：`key-upload initUniH5`或`npx key-upload initUniH5`
- 完善文档，对`distPath`参数进行更详细的说明，还有一些地方也进行了细微补充
- 优化代码

##### 0.1.4
支持用vue-cli命令行创建uni-app项目(Vue2版)打包h5端代码到服务器

##### 0.1.3
浪费了几个小版本号，这回终于能正常使用了，嘻嘻

##### 0.1.2
再次发布后发现无法使用三方npm库，于是把`devDependencies`改为`dependencies`，然后完善了下文档，再次发布

##### 0.1.1
发布后发现一些三方npm库无法调用，又尝试发布了一版

##### 0.1.0
第一次发布npm，磕磕碰碰。
