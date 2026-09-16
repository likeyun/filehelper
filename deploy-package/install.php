<?php
declare(strict_types=1);
$message=''; $error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    $host=trim((string)($_POST['db_host']??'127.0.0.1')) ?: '127.0.0.1';
    $name=trim((string)($_POST['db_name']??'')); $user=trim((string)($_POST['db_user']??'')); $pass=(string)($_POST['db_pass']??'');
    $admin=trim((string)($_POST['admin_user']??'')); $adminPass=(string)($_POST['admin_pass']??'');
    try {
        if ($name==='' || $user==='' || $admin==='' || $adminPass==='' || strlen($adminPass)<6) throw new RuntimeException('请完整填写数据库信息和管理员信息，管理员密码至少 6 位');
        if (!preg_match('/^[a-zA-Z0-9_]+$/',$name) || !preg_match('/^[\w\x{4e00}-\x{9fff}.-]{2,80}$/u',$admin)) throw new RuntimeException('数据库名或管理员账号格式不正确');
        $pdo=new PDO("mysql:host={$host};dbname={$name};charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        foreach(['messages','files','sessions','users'] as $table) $pdo->exec("DROP TABLE IF EXISTS `{$table}`");
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        $schema=file_get_contents(__DIR__.'/api/schema.sql'); $schema=preg_replace('/CREATE DATABASE IF NOT EXISTS[^;]+;|USE filesend;/i','',$schema);
        foreach(array_filter(array_map('trim',explode(';',$schema))) as $sql) $pdo->exec($sql);
        $config="<?php\nreturn ".var_export(['db_host'=>$host,'db_name'=>$name,'db_user'=>$user,'db_pass'=>$pass,'upload_dir'=>__DIR__.'/api/storage/uploads','public_file_base'=>'/api/files.php?id=','cors_origin'=>'*'],true).";\n";
        if (file_put_contents(__DIR__.'/api/config.php',$config)===false) throw new RuntimeException('无法写入 api/config.php');
        $pdo->prepare('INSERT INTO users(username,password_hash,is_admin,status) VALUES(?,?,1,"active")')->execute([$admin,password_hash($adminPass,PASSWORD_DEFAULT)]);
        foreach (glob(__DIR__.'/api/storage/uploads/*') ?: [] as $file) if (is_file($file)) unlink($file);
        $message='全新安装完成，请删除 install.php 后访问网站。';
    } catch(Throwable $e) { $error=$e->getMessage(); }
}
function h(string $v):string{return htmlspecialchars($v,ENT_QUOTES,'UTF-8');}
?><!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文件互传助手安装</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#dcecff,#eef2ff 48%,#d9f6ed);font:15px/1.5 system-ui,"Microsoft YaHei",sans-serif;color:#172033}.card{width:min(92vw,440px);padding:30px;border:1px solid #ffffffc2;border-radius:24px;background:#ffffff9c;backdrop-filter:blur(24px);box-shadow:inset 1px 1px #fff,0 25px 70px #28476b2b}h1{margin:0 0 6px;font-size:25px}p{color:#6d7e96;margin:0 0 22px}label{display:block;margin:12px 0 6px;color:#50627a;font-size:13px}input{width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid #ffffffc7;border-radius:11px;background:#ffffffb5;outline:0}button{width:100%;margin-top:18px;padding:12px;border:0;border-radius:11px;background:#2878ed;color:#fff;font-weight:700;font-size:15px}.ok{color:#168453;background:#e0f7eb;padding:10px;border-radius:9px}.err{color:#bb3d4d;background:#fff0f2;padding:10px;border-radius:9px}</style></head><body><main class="card"><h1>文件互传助手</h1><p>全新部署配置向导（会清空本应用旧数据）</p><?php if($message):?><div class="ok"><?=h($message)?></div><?php else:?><form method="post"><label>数据库服务器</label><input name="db_host" value="127.0.0.1" required><label>数据库名</label><input name="db_name" value="<?=h($_POST['db_name']??'')?>" required><label>数据库账号</label><input name="db_user" value="<?=h($_POST['db_user']??'')?>" required><label>数据库密码</label><input type="password" name="db_pass" required><label>管理员账号</label><input name="admin_user" value="<?=h($_POST['admin_user']??'')?>" required><label>管理员密码（至少 6 位）</label><input type="password" name="admin_pass" required><button>开始全新安装</button></form><?php if($error):?><div class="err"><?=h($error)?></div><?php endif; ?><?php endif;?></main></body></html>
