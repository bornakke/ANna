<?php
	$filename='exports/'.date('m-d-Y_His').".".$_POST['filetype'];
	
	if($_POST['filetype'] == "png"){
		// Strip the crud from the front of the string [1]
		$encodedString = substr($_POST['data'],strpos($_POST['data'],",")+1);
		// Cleanup File [2]
		$encodedString = str_replace(' ','+',$encodedString);
		// Decode string
		$decoded = base64_decode($encodedString);
	}
	else{
		$decoded = $_POST['data'];
	}

	file_put_contents($filename, $decoded);
	echo $filename;
?>