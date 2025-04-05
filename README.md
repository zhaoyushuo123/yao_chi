# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

使用react 19.1.0  + ant 帮我写一个网页，该网页是一个表单，该表单用来创建环境；

原来的页面
src/
├── components/
│   ├── ClusterCard/          # 集群卡片组件
│   │   ├── index.jsx         # 主组件
│   │   ├── NodeForm.jsx      # 节点表单部分
│   │   ├── DiskForm.jsx      # 硬盘表单部分
│   │   └── NetworkForm.jsx   # 网络表单部分
│   ├── TemplatePanel/        # 右侧模板面板
│   └── FavoritePanel/        # 右侧收藏面板
├── constants/
│   ├── options.js           # 所有选项配置
│   └── templates.js         # 模板配置
├── hooks/
│   ├── useCluster.ts        # 集群相关逻辑
│   └── useNamingRules.js    # 命名规则逻辑
└── PacificEnvForm.jsx       # 主入口组件


现在
src/
├── pages/                   # 页面级组件
│   ├── Home/                # 产品选择首页
│   │   └── index.jsx        # 包含产品卡片导航
│   ├── Pacific/             # Pacific产品页
│   │   └── index.jsx        # 迁移后的原PacificEnvForm
│   └── OtherProduct/        # 其他产品页
│       └── index.jsx        # 占位表单框架
├── components/              # 可复用组件
│   ├── ProductCard/         # 产品选择卡片组件
│   │   └── index.jsx        # 带路由跳转功能的卡片
│   ├── ClusterCard/         # 集群表单卡片
│   │   ├── index.jsx        # 主容器
│   │   ├── NodeForm.jsx     # 节点配置表单
│   │   ├── DiskForm.jsx     # 磁盘配置表单
│   │   └── NetworkForm.jsx  # 网络配置表单
│   ├── TemplatePanel/       # 右侧模板面板
│   │   └── index.jsx        # 典型配置展示
│   └── FavoritePanel/       # 右侧收藏面板
│       └── index.jsx        # 收藏管理功能
├── constants/               # 配置常量
│   ├── options.js           # 表单选项配置
│   ├── templates.js         # 模板数据
│   └── products.js          # 产品列表配置
├── hooks/                   # 自定义Hook
│   ├── useCluster.ts        # 集群状态逻辑
│   ├── useNamingRules.js    # 命名校验逻辑
│   └── useNavigateCompat.js # 路由导航兼容Hook
├── App.jsx                  # 主路由配置
└── index.jsx                # 应用入口

下面是功能描述：
1. 在网页左边是表单；在网页右边有三个模块"典型配置“，"用户收藏配置"，"典型配置描述"
2. 当用户点击"典型配置"时，会展示相应的"典型配置描述"，用户可以收藏自己当前的表单填写数据，用户也可以导入或者导出表单
3. 表单最后返回json格式，用户导入和导出的也应该是json格式
4. 现在描述的表单的细节：
4.1 默认展示一个集群，用户可以通过"增加集群"和"减少集群"来动态增减集群框的数量
4.2 每个集群在右上角标识自己是第几个集群，并且对于每个集群用户都需要输入"集群名称"，当集群数量大于等于2时，用户需要输入合一环境名称
4.3 集群里面为用户提供"业务大类"，"平台"，"集群角色"这三个可选下拉框，
4.3.1 ”业务大类“下面可选"NAS""BLOCK""DME"
4.3.2 "平台"下面可选"x86"和"arm"
4.3.3 ”集群角色"：
当"业务大类"为NAS时，“集群角色”可选"默认集群"、"复制集群"、"9000纳管本端集群"、"9000纳管远端集群"
当"业务大类"为BLOCK时，"集群角色"可选"默认集群"、"复制集群"、"cps集群"
当"业务大类"为DME时，"集群角色"可选"默认集群"
4.4 集群里面再放一个"增值服务“模块,针对不同的业务大类提供不同的选项，对于"增值服务”
当"业务大类"为BLOCK时，提供"VBS分离部署"和"普通部署"的二选一选择框，默认选择"普通部署"
当"业务大类"为NAS时，提供多选框："开启元数据服务"、"开启复制集群服务"、"开启分级服务"、"开启dpc docker多集群服务"
当"业务大类"为DME时，提供"DME集群部署"和"单DME"的二选一选择框，默认选择"DME集群部署"
4.5 集群里面再放一个"节点信息"模块，在"节点信息"模块里面可以通过"增加节点"和"减少节点"来动态增减单个"节点配置"
4.5.1 在单个"节点配置"中，首先提供一个"节点大类"的可选下拉框，该下拉框可选"存储"、"客户端"
4.5.2 当用户勾选"节点大类”为"客户端"时，在"节点配置"里面的右边展示"业务服务"多选框 和 "节点数量"的数量框；"业务服务"多选框可选"NFS""OBS""DPC""FI""HDFS_FI"，其中HDFS_FI和FI不可同时选
4.5.3 当用户勾选"节点大类"为"存储"时，在"节点配置"里面的右边展示"存储节点角色"可选下拉框 和 "节点数量"的数量框；"存储节点角色"可选"FSM"、"FSA"、"VBS"；其中"VBS"只有当"业务大类"为block时才可选
4.5.4 当用户勾选"业务大类"为"block“时，"节点大类"不展示"客户端"；并且当用户将"业务大类"从其他切换到"BLOCK"时，应该删除已经存在的"节点大类"为"客户端"的”节点配置"动态增减框
4.5.5 同理，当用户勾选"业务大类"为DME时，"节点大类"不展示"存储"；并且当用户切换为DME时，应当删除存储
4.5.6 当用户勾选"节点大类“为”客户端"时，在"节点配置"里面提供一个"客户端镜像"的可选下拉框，默认"centos77"，另外还有可选"ubuntu“和"euler9"
4.5.7 当用户勾选”节点大类"为"存储"时，在"节点配置"里面提供一个"存储镜像"的可选下拉框，默认"euler9"，另外可选"euler10"和"euler11"
4.6 当集群里有"节点大类"为"存储"的节点时，在"集群信息"里面的下面新增一个"存储硬盘信息"的模块
4.6.1 "存储硬盘信息"模块有"硬盘配置"动态增减框，通过"添加硬盘组"和"删除硬盘组"来增减
4.6.2 "硬盘配置"里面有"硬盘类型"可选下拉框 ”硬盘容量“数量框 "硬盘数量"数量框
4.6.3 "硬盘配置"可选SSD 和 HDD 默认勾选SSD ； ”硬盘容量" 默认80G ，"硬盘数量"默认4块
4.6.4 当用户勾选"开启复制集群服务“时，硬盘数量不得少于5块；当用户勾选"开启元数据服务"时，硬盘数量不得少于5块；当用户同时勾选"元数据"和"复制集群"时，硬盘数量不得少于6块
4.7 在集群里面再放一个"存储网卡信息"模块，可以选"网卡数量"、"网卡类型"、"业务网络ip数量";
4.7.1 "网卡数量"默认4，最大只能选4，”网卡类型"从TPC和ROCE中二选一，"业务网络IP数量"默认5
4.7.2 当集群中有存储节点时，展示"存储网卡信息"
5. 这里给出一些默认的典型配置类型：
   '3NODE_1Client', '3NODE_3Client', '3NODE_1DPC', '3NODE_3DPC',
   '6NODE_1Client', '9NODE_1Client', '9000纳管',
   '3NODE_1FI', '3NODE_HDFS_FI', '3NODE_CONVERGE_FI', '3NODE_CONVERGE_HDFS_FI',
   '2DC', '3DC', '2GFS', '3GFS', 'BLOCK_Template', 'DME_Template', '6NODE_VBS_Sperate'

6. 在表单的提交按钮旁边新增一个"使用推荐命名"按钮；当用户点击该按钮时，不用立即提交表单，而是将表单给"命名"模块，由"命名"模块来根据用户表单填写的情况来做判断并给出推荐命名；
7. 不同集群的集群名称应该不同
8. 这个表单只针对了一种产品pacifc，在未来，可能会想扩展产品类型；并且针对不同的产品，客户端的"业务服务" 存储的"存储节点角色" 集群的“业务大类”、集群的"增值服务"都不尽相同，保留一定的可扩展性


### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
