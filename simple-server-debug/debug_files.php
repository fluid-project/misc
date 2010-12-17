<?php 
// A test script to write the value of global array $_FILES into a log file
// $log : optional

function debug_to_log($var, $log='') {
	if ($log == '') $log = dirname(__FILE__). '/debug_files.log';
	
	$handle = fopen($log, 'a');
	fwrite($handle, "\n\n");
	fwrite($handle, date("F j, Y, g:i a"));
	fwrite($handle, "\n");
	fwrite($handle, var_export($var,1));
	
	fclose($handle);
}

debug_to_log($_FILES);
exit;
?>
