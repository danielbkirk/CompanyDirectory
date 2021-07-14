<?php

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {

		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}

	$name1 = $_REQUEST['name1'];
	$name2 = $_REQUEST['name2'];
	$deptID = $_REQUEST['deptID'];
	$locID = $_REQUEST['locID'];

	$and = ' AND ';

	$query = 'SELECT p.id, p.lastName, p.firstName, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE ';
	$counter = 0;

	$searchArray = array($name1, $name2, $deptID, $locID);
	foreach ($searchArray as $value){
		if ($value){
			$counter++;
		}
	}
	unset($value);

	if ($name1 && $name2){
		$query .= ' ((p.firstName LIKE "%' . $name1 . '%" AND p.lastName LIKE "%' . $name2 . '%") OR (p.firstName like "%' . $name2 . '%" AND p.lastName LIKE "%'. $name1 .'%"))';
		

		if ($counter > 2){
			$query .= $and;
			$counter -=2;
		}
	} elseif ($name1) {
		$query .= ' ((p.firstName LIKE "%' . $name1 . '%") OR (p.lastName LIKE "%'. $name1 .'%")) ';
		

		if ($counter > 1){
			$query .= $and;
			$counter--;
		}
	}

	

	if ($deptID){
		if ($counter > 1) {
			$query .= ' p.departmentID = ' . $deptID . $and;
			$counter--;
		} else {
			$query .= ' p.departmentID = ' . $deptID;
		}

	}

	if ($locID){
		if ($counter > 1) {
			$query .= ' d.locationID = ' . $locID . $and;
			$counter--;
		} else {
			$query .= ' d.locationID = ' . $locID;
		}
	}


	$query .= ' ORDER BY p.lastName, p.firstName';

	$result = $conn->query($query);

	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";
		$output['status']['query'] = $query;
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}

   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	//https://stackoverflow.com/questions/12706359/how-to-group-subarrays-by-a-column-value


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;

	mysqli_close($conn);

	echo json_encode($output);

?>
