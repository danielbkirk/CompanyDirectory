<?php
$counter = 0;
$result = array("pear", "plum", "pineapple");
array_push($result, "apple");
print_r($result);

foreach ($result as $value){
	if ($value){
		$counter++;
	}
}

unset($value);
print_r($counter);


?>
