<div align="center">

# 文件互传助手

一个轻量、私有、可自部署的 Web 文件互传工具。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb.svg)](client/package.json)
[![Backend](https://img.shields.io/badge/backend-PHP%20%2B%20MySQL-777bb4.svg)](server/)

支持在电脑、手机和其他已登录设备之间传输文字、图片、视频及任意文件，并永久保留传输记录。

</div>

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [生产部署](#生产部署)
- [用户与权限](#用户与权限)
- [API](#api)
- [安全说明](#安全说明)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)
- [路线图](#路线图)
- [许可证](#许可证)

## 项目简介

文件互传助手面向个人、团队和内网环境设计，提供类似聊天软件的文件交换体验。项目采用前后端分离架构，前端可以部署在任意静态网站服务上，后端使用原生 PHP 和 MySQL，适合部署到自己的服务器。

项目默认使用 Web 客户端，不依赖桌面端 EXE、Rust 或 Electron，部署简单、兼容性更好。

## 功能特性

### 消息与文件

- 发送纯文字、图片、视频和任意后缀文件
- 图片直接显示，点击后在当前页面弹出预览
- 视频直接渲染播放
- PDF、Word、Excel、PPT、JSON、JS、HTML、压缩包、音频等常见类型自动显示文件图标
- 文本中的 HTTP/HTTPS 链接自动转换为可点击链接
- 支持拖拽上传、多文件上传和移动端文件选择
- 支持文本消息一键复制，并兼容移动端复制失败回退方案

### 记录与性能

- 文件互传记录永久保留
- 最近文件素材库和文件名即时搜索
- 图片懒加载，聊天记录中的图片最大宽度为 300px
- 文件接口支持浏览器私有缓存、ETag 和 Last-Modified
- 页面刷新后自动定位到最新消息
- Hash 路由保留当前页面状态，刷新不会回到首页

### 用户管理

- 关闭公开注册，仅允许管理员创建账号
- 超级管理员可以创建、编辑、停用和删除普通用户
- 每页显示 8 个用户，支持前端搜索和分页
- 用户可以自行修改密码
- 编辑用户时密码留空表示不修改

### 界面体验

- React + Ant Design
- 液态玻璃视觉风格
- 桌面端和手机端响应式布局
- 移动端安全区域适配
- Modal 弹出和关闭动画
- 网站 favicon 支持

## 技术架构

```text
浏览器 / 手机浏览器
          │
          ▼
React + Vite + Ant Design
          │  REST API / Bearer Token
          ▼
原生 PHP API ─────── MySQL
          │
          ▼
      文件存储目录
```

前端默认通过同源路径访问 API：

```text
/api/auth.php
/api/messages.php
/api/upload.php
/api/files.php
```

开发环境可以通过 `VITE_API_BASE` 指向独立的 PHP API 服务。

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- PHP 8+
- MySQL 5.7+ 或 MariaDB

### 安装依赖并启动前端

```bash
git clone https://github.com/likeyun/filehelper.git
cd filehelper/client
npm install
npm run dev
```

Vite 默认开发地址通常为 `http://localhost:5173`。

如果 API 不在同源地址，可以设置：

```bash
VITE_API_BASE=http://localhost:8080/api npm run dev
```

### 构建前端

```bash
cd client
npm run build
```

构建产物位于 `client/dist/`。

## 生产部署

项目提供 `deploy-package/` Web 部署目录，也可以自行构建后部署。

### 使用部署包

1. 将部署包根目录中的 `index.html`、`assets/`、`favicon.png`、`api/` 和 `install.php` 上传到网站根目录。
2. 确保 `api/storage/uploads/` 目录可写。
3. 创建一个空的 MySQL 数据库，并准备拥有该数据库读写和建表权限的账号。
4. 访问 `https://你的域名/install.php`。
5. 在安装向导中填写数据库信息和管理员账号密码。
6. 安装成功后立即删除 `install.php`。

安装页只预填数据库服务器 `127.0.0.1`，不会预填或继承旧的数据库、管理员账号和密码。

> 安装向导会清理本应用的相关数据表和上传文件，仅用于全新部署。已有正式数据时不要重复执行。

### 手动部署

```text
client/dist/*  → 网站根目录
server/*       → 网站根目录/api/
```

然后复制配置文件：

```bash
cp api/config.example.php api/config.php
```

编辑 `api/config.php`，填写数据库连接信息，并确保上传目录存在且可写。

### Nginx 配置

项目提供参考配置：[server/nginx-location.conf](server/nginx-location.conf)

核心规则如下：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ ^/api/.*\.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
}
```

## 用户与权限

| 角色 | 权限 |
| --- | --- |
| 超级管理员 | 登录、传输文件、修改密码、创建/编辑/停用/删除普通用户 |
| 普通用户 | 登录、传输文件、查看记录、修改自己的密码 |
| 已停用用户 | 无法登录，历史记录不会自动删除 |

系统不开放公开注册。管理员创建普通用户后，账号初始密码为 `123456`，建议首次登录后立即修改。

## API

除登录接口外，其他接口需要携带：

```http
Authorization: Bearer <token>
```

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth.php?action=login` | POST | 用户登录 |
| `/api/messages.php` | GET | 获取消息记录 |
| `/api/messages.php` | POST | 发送文字消息 |
| `/api/upload.php` | POST | 上传文件 |
| `/api/files.php?id=<id>` | GET | 读取文件 |
| `/api/users.php?action=list` | GET | 获取用户列表，仅管理员 |
| `/api/users.php?action=create` | POST | 创建普通用户，仅管理员 |
| `/api/users.php?action=update&id=<id>` | POST | 编辑用户，仅管理员 |
| `/api/users.php?action=delete&id=<id>` | POST | 删除用户，仅管理员 |
| `/api/users.php?action=change-password` | POST | 修改当前用户密码 |

## 安全说明

- 生产环境必须启用 HTTPS。
- 不要提交 `api/config.php`、数据库密码、SSH 私钥或真实上传数据。
- 安装成功后必须删除 `install.php`。
- 生产环境建议使用独立的 MySQL 应用账号，不要使用 root。
- 上传目录应禁止执行 PHP 等脚本文件。
- 建议根据服务器资源限制 PHP 上传大小和单文件大小。
- 定期备份数据库和 `api/storage/uploads/`。
- 文件读取接口会校验登录会话，不能只凭文件 ID 读取其他用户文件。

## 项目结构

```text
filehelper/
├─ client/
│  ├─ src/main.jsx              # React 应用入口
│  ├─ src/styles.css            # 全局与响应式样式
│  ├─ public/favicon.png        # 网站图标
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ auth.php                  # 登录
│  ├─ messages.php              # 消息
│  ├─ upload.php                # 上传
│  ├─ files.php                 # 文件读取与缓存
│  ├─ users.php                 # 用户管理与密码
│  ├─ schema.sql                # 数据库结构
│  └─ config.example.php        # 配置模板
├─ deploy-package/              # 可直接上传的 Web 部署目录
├─ LICENSE
└─ README.md
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。

建议的贡献流程：

1. Fork 本项目。
2. 创建功能分支：`git checkout -b feat/your-feature`。
3. 完成修改并进行本地验证。
4. 提交清晰的 commit：`git commit -m "feat: describe your change"`。
5. 推送分支并创建 Pull Request。

提交代码时请注意：

- 不要提交真实服务器配置、密钥、账号密码或上传文件。
- UI 修改请同时检查桌面端和手机端。
- API 修改请同步更新 README 和数据库说明。
- 新功能尽量保持向后兼容。

## 路线图

- [ ] 分块上传和断点续传
- [ ] 文件上传进度与失败重试
- [ ] 服务端分页加载历史消息
- [ ] 局域网 WebRTC 直连传输
- [ ] 更细粒度的文件权限控制
- [ ] 自动化测试与 CI

## 许可证

本项目采用 [MIT License](LICENSE) 开源。

