# 文件互传助手 Web 部署包

这是 Web-only 部署包，不包含桌面 EXE、Node.js、Rust 或 `node_modules`。

## 部署

1. 将本包根目录中的 `index.html`、`assets` 和 `api` 复制到站点根目录。
2. 确保 `api/storage/uploads` 可写，并保留其中的 `.htaccess`。
4. 访问 `/install.php`，填写 MySQL 信息并完成安装。
5. 安装完成后立即删除站点根目录下的 `install.php`。

安装页只会预填数据库服务器 `127.0.0.1`，数据库名、数据库账号、数据库密码、管理员账号和管理员密码都需要你自行填写，不会连接或继承旧站点数据。

管理员账号和密码由你在安装页创建；安装程序不会预设管理员密码。

## 当前线上站点

https://ucloud-dev3.1-url.cn/
