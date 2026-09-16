<?php
require __DIR__ . '/bootstrap.php'; $user=auth_user($pdo);
if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) reply(['error'=>'上传失败'],422);
$f=$_FILES['file']; if ($f['size'] > 1024*1024*1024) reply(['error'=>'单文件不能超过 1GB'],422);
$dir=$config['upload_dir']; if (!is_dir($dir)) mkdir($dir,0750,true);
$stored=bin2hex(random_bytes(20)); $target=$dir . DIRECTORY_SEPARATOR . $stored;
if (!move_uploaded_file($f['tmp_name'],$target)) reply(['error'=>'无法保存文件'],500);
$mime=substr((string)($f['type'] ?: 'application/octet-stream'),0,190); $name=substr(basename((string)$f['name']),0,255);
$pdo->prepare('INSERT INTO files(user_id,original_name,stored_name,mime_type,size_bytes) VALUES(?,?,?,?,?)')->execute([$user['id'],$name,$stored,$mime,$f['size']]);
$fileId=(int)$pdo->lastInsertId(); $kind=str_starts_with($mime,'image/')?'image':(str_starts_with($mime,'video/')?'video':'file');
$pdo->prepare('INSERT INTO messages(user_id,message_type,file_id) VALUES(?,?,?)')->execute([$user['id'],$kind,$fileId]);
reply(['id'=>(int)$pdo->lastInsertId(),'file_id'=>$fileId]);
