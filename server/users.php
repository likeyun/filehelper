<?php
require __DIR__ . '/bootstrap.php';
$user = auth_user($pdo); $action = $_GET['action'] ?? 'list'; $data = json_input();
if ($action === 'change-password') {
    $old=(string)($data['old_password']??''); $new=(string)($data['new_password']??'');
    if (strlen($new)<6 || !password_verify($old,$user['password_hash'])) reply(['error'=>'原密码错误或新密码少于 6 位'],422);
    $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($new,PASSWORD_DEFAULT),$user['id']]);
    reply(['message'=>'密码修改成功']);
}
if (!$user['is_admin']) reply(['error'=>'仅超级管理员可管理用户'],403);
if ($action === 'list') { $rows=$pdo->query('SELECT id,username,is_admin,status,created_at FROM users ORDER BY id')->fetchAll(); reply(['users'=>$rows]); }
if ($action === 'create') {
    $name=trim((string)($data['username']??'')); $pass=(string)($data['password']??'123456');
    if (!preg_match('/^[\w\x{4e00}-\x{9fff}.-]{2,80}$/u',$name) || strlen($pass)<6) reply(['error'=>'用户名至少 2 位，密码至少 6 位'],422);
    try{$pdo->prepare('INSERT INTO users(username,password_hash,is_admin) VALUES(?,?,0)')->execute([$name,password_hash($pass,PASSWORD_DEFAULT)]);}catch(Throwable $e){reply(['error'=>'用户名已存在'],409);}
    reply(['message'=>'账号创建成功']);
}
if ($action === 'update') {
    $id=(int)($_GET['id']??0); $name=trim((string)($data['username']??'')); $status=(string)($data['status']??'active'); $password=(string)($data['password']??'');
    if ($id<1 || !preg_match('/^[\w\x{4e00}-\x{9fff}.-]{2,80}$/u',$name)) reply(['error'=>'用户名至少 2 位'],422);
    if (!in_array($status,['active','disabled'],true)) reply(['error'=>'账号状态无效'],422);
    if ($password!=='' && strlen($password)<6) reply(['error'=>'新密码至少 6 位'],422);
    $sql='UPDATE users SET username=?, status=?'; $params=[$name,$status];
    if ($password!=='') {$sql.=', password_hash=?'; $params[]=password_hash($password,PASSWORD_DEFAULT);}
    $sql.=' WHERE id=? AND is_admin=0'; $params[]=$id;
    try{$pdo->prepare($sql)->execute($params);}catch(Throwable $e){reply(['error'=>'用户名已存在'],409);}
    if ($pdo->query('SELECT ROW_COUNT()')->fetchColumn()<1) reply(['error'=>'不能编辑超级管理员或用户不存在'],403);
    reply(['message'=>'用户信息已更新']);
}
if ($action === 'delete') {
    $id=(int)($_GET['id']??0);
    if ($id<1 || $id===(int)$user['id']) reply(['error'=>'不能删除当前登录账号'],403);
    $q=$pdo->prepare('DELETE FROM users WHERE id=? AND is_admin=0'); $q->execute([$id]);
    if ($q->rowCount()<1) reply(['error'=>'不能删除超级管理员或用户不存在'],403);
    reply(['message'=>'用户已删除']);
}
reply(['error'=>'未知操作'],400);
