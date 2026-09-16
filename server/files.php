<?php
declare(strict_types=1); $config=require __DIR__.'/config.php'; require __DIR__.'/bootstrap.php';
$id=(int)($_GET['id'] ?? 0); $auth=$_SERVER['HTTP_AUTHORIZATION']??''; $presentedToken='';
if (preg_match('/Bearer\s+(.+)/i',$auth,$m)) $presentedToken=trim($m[1]);
if (!$presentedToken) $presentedToken=(string)($_GET['token']??'');
$q=$pdo->prepare('SELECT f.* FROM files f JOIN sessions s ON s.user_id=f.user_id AND s.token_hash=? AND s.expires_at>NOW() WHERE f.id=?');
$q->execute([hash('sha256',$presentedToken),$id]); $f=$q->fetch(); if(!$f) { http_response_code(401); exit; }
$path=$config['upload_dir'].DIRECTORY_SEPARATOR.$f['stored_name']; if(!is_file($path)){http_response_code(404);exit;}
$etag='"'.sha1($f['id'].'|'.$f['stored_name'].'|'.$f['size_bytes'].'|'.$f['created_at']).'"';
$modified=filemtime($path) ?: time();
header('Content-Type: '.$f['mime_type']); header('Content-Length: '.filesize($path)); header('Content-Disposition: inline; filename="'.rawurlencode($f['original_name']).'"');
header('Cache-Control: private, max-age=2592000, immutable'); header('ETag: '.$etag); header('Last-Modified: '.gmdate('D, d M Y H:i:s',$modified).' GMT');
if (trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag || strtotime((string)($_SERVER['HTTP_IF_MODIFIED_SINCE'] ?? '')) >= $modified) { http_response_code(304); exit; }
readfile($path);
