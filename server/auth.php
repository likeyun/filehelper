<?php
require __DIR__ . '/bootstrap.php';
$data = json_input(); $action = $_GET['action'] ?? 'login';
if ($action !== 'login') reply(['error'=>'注册已关闭，请联系超级管理员创建账号'], 403);
$username = trim((string)($data['username'] ?? '')); $password = (string)($data['password'] ?? '');
if (!preg_match('/^[\w\x{4e00}-\x{9fff}.-]{2,80}$/u', $username) || strlen($password) < 6) reply(['error'=>'用户名至少 2 位，密码至少 6 位'], 422);
$q = $pdo->prepare('SELECT * FROM users WHERE username=?'); $q->execute([$username]); $user = $q->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) reply(['error'=>'用户名或密码错误'], 401);
if (($user['status'] ?? 'active') !== 'active') reply(['error'=>'该账号已停用，请联系超级管理员'], 403);
$token = bin2hex(random_bytes(32));
$pdo->prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(NOW(), INTERVAL 30 DAY))')->execute([hash('sha256',$token),$user['id']]);
reply(['token'=>$token,'user'=>['id'=>(int)$user['id'],'username'=>$user['username'],'is_admin'=>(bool)$user['is_admin']]]);
