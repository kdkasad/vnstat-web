/*
 * Round to given number of decimal places
 */
function roundTo(number, precision) {
	return Math.round(number * (10 ** precision)) / (10 ** precision);
}

/*
 * Create the necessary HTML elements for an interface's traffic graph
 *
 * ifname: the name of the interface (e.g. 'eth0' or 'wlp2s0')
 */
function createGraphElements(ifname) {
	document.getElementById('graph-grid').insertAdjacentHTML( 'beforeend',
		`<div class="canvas-container"><canvas id="graph-${ifname}">Your browser does not support canvas elements.</canvas></div>`);
}

/*
 * Create the graph content using Chart.js
 *
 * ifname: the name of the interface (e.g. 'eth0' or 'wlp2s0')
 * traffic: the data from the 'traffic' object of the interface
 */
function createGraphContentDaily(ifname, traffic) {
	const options = {
		title: {
			display: true,
			text: ifname,
		},
		tooltips: {
			callbacks: {
				label: (tti, data) => {
					return data.datasets[tti.datasetIndex].label + ": " + data.datasets[tti.datasetIndex].data[tti.index] + ' GiB';
				}
			}
		},
		scales: {
			xAxes: [{
				stacked: stackGraphs,
				gridLines: {
					color: fgcolor,
				},
			}],
			yAxes: [{
				stacked: stackGraphs,
				gridLines: {
					color: fgcolor,
				},
				ticks: {
					beginAtZero: true,
				},
			}],
		},
	};

	const data = {
		labels: [],
		datasets: [
			{
				label: 'Rx',
				data: [],
				backgroundColor: '#5DADE2',
				borderColor: '#3498DB',
			},
			{
				label: 'Tx',
				data: [],
				backgroundColor: '#58D68D',
				borderColor: '#2ECC71',
			},
		],
	};
	if (!stackGraphs) {
		data.datasets.push({
				label: 'Total',
				data: [],
				backgroundColor: '#F7DC6F',
				borderColor: '#F4D03F',
			});
	}

	/* add each day's data to the graph */
	for (const day of traffic.day) {
		/* add a label for the day */
		const date = new Date(day.date.year, day.date.month, day.date.day);
		data.labels.push(date.toLocaleDateString());

		/* add the rx/tx data for the day */
		const rx = roundTo(day.rx / (1024 ** 3), 3);
		const tx = roundTo(day.tx / (1024 ** 3), 3);
		data.datasets[0].data.push(rx);
		data.datasets[1].data.push(tx);
		if (!stackGraphs) {
			const total = roundTo(rx + tx, 3);
			data.datasets[2].data.push(total);
		}
	}

	const ctx = document.getElementById(`graph-${ifname}`);
	const graph = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: options,
	});
}

/*
 * Create the graph content using Chart.js
 *
 * ifname: the name of the interface (e.g. 'eth0' or 'wlp2s0')
 * traffic: the data from the 'traffic' object of the interface
 */
function createGraphContentHourly(ifname, traffic) {
	const options = {
		title: {
			display: true,
			text: ifname,
		},
		tooltips: {
			callbacks: {
				label: (tti, data) => {
					return data.datasets[tti.datasetIndex].label + ": " + data.datasets[tti.datasetIndex].data[tti.index] + ' GiB';
				}
			}
		},
		scales: {
			xAxes: [{
				stacked: stackGraphs,
				gridLines: {
					color: fgcolor,
				},
			}],
			yAxes: [{
				stacked: stackGraphs,
				gridLines: {
					color: fgcolor,
				},
				ticks: {
					beginAtZero: true,
				},
			}],
		},
	};

	const data = {
		labels: [],
		datasets: [
			{
				label: 'Rx',
				data: [],
				backgroundColor: '#5DADE2',
				borderColor: '#3498DB',
			},
			{
				label: 'Tx',
				data: [],
				backgroundColor: '#58D68D',
				borderColor: '#2ECC71',
			},
		],
	};
	if (!stackGraphs) {
		data.datasets.push({
				label: 'Total',
				data: [],
				backgroundColor: '#F7DC6F',
				borderColor: '#F4D03F',
			});
	}

	/* add each day's data to the graph */
	for (const hour of traffic.hour) {
		/* add a label for the day */
		const date = new Date(hour.date.year, hour.date.month, hour.date.day, hour.time.hour);
		data.labels.push(date.toLocaleString());

		/* add the rx/tx data for the day */
		const rx = roundTo(hour.rx / (1024 ** 3), 3);
		const tx = roundTo(hour.tx / (1024 ** 3), 3);
		data.datasets[0].data.push(rx);
		data.datasets[1].data.push(tx);
		if (!stackGraphs) {
			const total = roundTo(rx + tx, 3);
			data.datasets[2].data.push(total);
		}
	}

	const ctx = document.getElementById(`graph-${ifname}`);
	const graph = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: options,
	});
}

/*
 * Process the JSON data received from vnstat
 *
 * data: an object containing the parsed JSON data
 */
function processDataDaily(data) {
	const ifs = data.interfaces;

	for (let i = 0; i < ifs.length; i++) {
		/* If there's no data for this interface, remove it from the list */
		if (ifs[i].traffic.day.length <= 0)
			ifs.splice(i--, 1);
	}

	/* add a canvas for each interface */
	for (const iface of ifs)
		createGraphElements(iface.name);

	/* create a graph for each interface */
	for (const iface of ifs) {
		createGraphContentDaily(iface.name, iface.traffic);
	}
}

function processDataHourly(data) {
	const ifs = data.interfaces;

	for (let i = 0; i < ifs.length; i++) {
		if (ifs[i].traffic.hour.length <= 0)
			ifs.splice(i--, 1);
	}

	/* add a canvas for each interface */
	for (const iface of ifs)
		createGraphElements(iface.name);

	/* create a graph for each interface */
	for (const iface of ifs) {
		createGraphContentHourly(iface.name, iface.traffic);
	}
}

const fgcolor = window.getComputedStyle(document.documentElement).getPropertyValue('--fg-color').trim()
const bgcolor = window.getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim()

/* Chart.js global configuration options */
Chart.defaults.global.elements.rectangle.borderWidth = 2;
Chart.platform.disableCSSInjection = true;
Chart.defaults.global.defaultFontColor = fgcolor;

const usp = new URLSearchParams(window.location.search);

/* Set 'timeSlots' based on URL query parameter 'nr' */
let timeSlots;
if (usp.get('nr'))
	timeSlots = usp.get('nr');

/* Set 'timeScale' based on URL query parameter 'ts' */
let timeScale;
switch (usp.get('ts')) {
	case 'h':
		timeScale = 'h';
		document.getElementById('ts-d').selected = false;
		document.getElementById('ts-h').selected = true;
		if (!timeSlots)
			timeSlots = 12;
		break;
	case 'd':
	default:
		timeScale = 'd';
		document.getElementById('ts-d').selected = true;
		document.getElementById('ts-h').selected = false;
		if (!timeSlots)
			timeSlots = 7;
		break;
}

/* Set time slot input */
document.getElementById('nr-box').value = timeSlots;

/* Get stacking configuration based on URL query parameter 's' */
let stackGraphs = false;
if (usp.get('stack') || usp.has('stack')) {
	stackGraphs = true;
	document.getElementById('stack-checkbox').checked = true;
}

/* Fetch JSON data from vnstat and create graphs */
fetch(`data.json?ts=${timeScale}&nr=${timeSlots}`, {
	credentials: 'same-origin',
})
	.then(response => response.json())
	.then(data => {
		if (timeScale === 'h')
			processDataHourly(data);
		else if (timeScale === 'd')
			processDataDaily(data);
	});
