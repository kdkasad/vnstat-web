<?php

class vnstat {
	protected $version;
	protected $json_version;
	protected $data;

	public function __construct() {
		$output_stream = popen('vnstat --json', 'r');

		if (is_resource($output_stream)) {
			$this->parseJSONData(stream_get_contents($output_stream));
		} else {
			exit();
		}
	}

	private function parseJsonData($json) {
		$data = json_decode($json, true);

		if (json_last_error() != JSON_ERROR_NONE)
			throw new Exception('Invalid JSON received from vnstat');

		$this->data = $data;
		$this->version = $data['vnstatversion'];
		$this->json_version = $data['jsonversion'];

		if ($this->json_version !== '2')
			throw new Exception('Unsupported vnstat JSON version');
	}

	public function getVersion() {
		return $this->version;
	}

	public function getJsonVersion() {
		return $this->json_version;
	}

	public function getInterfaces() {
		$ifnames = [];
		foreach ($this->data['interfaces'] as $interface)
			array_push($ifnames, $interface['name']);
		return $ifnames;
	}

	public function getInterfaceData($ifname, $timescale, $period) {
		/* placeholder for later */
		$data = [];

		/* get the index of the specified interface */
		$ifindex = array_search($ifname, array_column($this->data['interfaces'], 'name'));
		if ($ifindex === false)
			throw new Exception('Invalid interface');

		$traffic = $this->data['interfaces'][$ifindex]['traffic'];

		if ($timescale === 'hour') {
			foreach ($traffic['hour'] as $entry) {
				array_push($data, [
					'rx' => $entry['rx'],
					'tx' => $entry['tx'],
					'time' => mktime($entry['time']['hour'], $entry['time']['minute'], 0, $entry['date']['month'], $entry['date']['day'], $entry['date']['year']),
				]);
			}
		} elseif ($timescale === 'day') {
			foreach ($traffic['day'] as $entry) {
				array_push($data, [
					'rx' => $entry['rx'],
					'tx' => $entry['tx'],
					'time' => mktime(0, 0, 0, $entry['date']['month'], $entry['date']['day'], $entry['date']['year']),
				]);
			}
		} elseif ($timescale === 'month') {
			foreach ($traffic['month'] as $entry) {
				array_push($data, [
					'rx' => $entry['rx'],
					'tx' => $entry['tx'],
					'time' => mktime(0, 0, 0, $entry['date']['month'], 1, $entry['date']['year']),
				]);
			}
		} elseif ($timescale === 'year') {
			foreach ($traffic['year'] as $entry) {
				array_push($data, [
					'rx' => $entry['rx'],
					'tx' => $entry['tx'],
					'time' => mktime(0, 0, 0, 0, 0, $entry['date']['year']),
				]);
			}
		} elseif ($timescale === 'top') {
			foreach ($traffic['top'] as $entry) {
				array_push($data, [
					'rx' => $entry['rx'],
					'tx' => $entry['tx'],
					'time' => mktime(0, 0, 0, $entry['date']['month'], $entry['date']['day'], $entry['date']['year']),
				]);
			}
		}

		if ($timescale === 'top') {
			/* sort data in order of total bandwidth */
			usort($data, function($e1, $e2) {
				return ($e1['tx'] + $e1['rx']) - ($e2['tx'] + $e2['rx']);
			});
		} else {
			/* sort data in chronological order */
			usort($data, function($entry1, $entry2) {
				return $entry1['time'] - $entry2['time'];
			});
		}

		/* truncate to match period */
		if ($period < sizeof($data))
		       $data = array_slice($data, -$period, $period);

		return $data;
	}
}

$VALID_TIMESCALES = ['hour', 'day', 'month', 'year', 'top'];
$response_data = [];
$vs = new vnstat;

$request_type = $_GET['requesttype'];

if ($request_type === 'data') {
	/* return data for interfaces */
	$timescale = $_GET['timescale'];
	$ifname = $_GET['ifname'];
	$period = $_GET['period'];

	/* add an error entry if 'period' is empty or is not one of the supported time scales */
	if (array_search($timescale, $VALID_TIMESCALES, true) === false) {
		array_push($response_data, [
			'reason' => 1,
			'param' => 'timescale',
			'message' => 'invalid time scale',
		]);
	}

	/* add an error entry if 'period' is empty or is not an integer */
	if (filter_var($period, FILTER_VALIDATE_INT) === false) {
		array_push($response_data, [
			'reason' => 1,
			'param' => 'period',
			'message' => 'invalid time period',
		]);
	}

	/* only check 'ifname' validity if it is set */
	if (array_search($ifname, $vs->getInterfaces(), true) === false) {
		array_push($response_data, [
			'reason' => 1,
			'param' => 'ifname',
			'message' => 'interface not available',
		]);
	}

	/*
	 * at this point, if 'response_data' is not empty, that means an invalid
	 * parameter was given
	 */
	if (count($response_data) > 0) {
		http_response_code(400);
		echo json_encode($response_data);
		die();
	}

	/* return data from vnstat */
	echo json_encode($vs->getInterfaceData($ifname, $timescale, $period));
} elseif ($request_type === 'iflist') {
	/* return list of interfaces */
	echo json_encode($vs->getInterfaces());
} else {
	/* invalid request type */
	http_response_code(400);
	array_push($response_data, [
		'reason' => 2,
		'param' => 'requesttype',
		'message' => 'invalid request type',
	]);
	echo json_encode($response_data);
	die();
}

?>
