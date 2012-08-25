<?php

$files = array(
	'edfa80dc88a06a19b51f9ac3bb52aaca035a060b' => 'jqcarousel.zip'
);
$fileName = $_GET['file'];
if (file_exists($files[$fileName])) {
	$file = fopen('stat.txt', 'a+');
	fwrite($file, $files[$fileName] . "\n" . $_SERVER['HTTP_REFERER'] . "\n"
		. $_SERVER['HTTP_USER_AGENT'] . "\n"
		. $_SERVER['REMOTE_ADDR'] . "\n------------------------\n");
	fclose($file);
	header('Location:./' . $files[$fileName]);
} else {
	echo 'This file does not exists!';
}
?>
