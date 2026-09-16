<?php
require __DIR__ . '/bootstrap.php'; $user = auth_user($pdo);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $after = max(0, (int)($_GET['after'] ?? 0)); $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $q=$pdo->prepare('SELECT m.*, f.original_name, f.mime_type, f.size_bytes, f.id AS attachment_id FROM messages m LEFT JOIN files f ON f.id=m.file_id WHERE m.user_id=? AND m.id>? ORDER BY m.id ASC LIMIT ' . $limit);
    $q->execute([$user['id'], $after]); $rows=$q->fetchAll();
    foreach ($rows as &$row) { $row['id']=(int)$row['id']; $row['file_url']=$row['attachment_id'] ? (($config['public_file_base'] ?? '/files.php?id=') . $row['attachment_id']) : null; }
    reply(['messages'=>$rows]);
}
$data=json_input(); $type=$data['message_type'] ?? 'text'; $body=trim((string)($data['body'] ?? ''));
if ($type !== 'text' || $body === '') reply(['error'=>'消息内容无效'],422);
$q=$pdo->prepare('INSERT INTO messages(user_id,message_type,body) VALUES(?,?,?)'); $q->execute([$user['id'],'text',$body]); reply(['id'=>(int)$pdo->lastInsertId()]);
