/*
 * Round to given number of decimal places
 *
 * number: number to round
 * precision: number of decimals places
 */
Math.roundTo = function(number, precision) {
	return Math.round(number * (10 ** precision)) / (10 ** precision);
}

Date.prototype.getDayOfWeekName = function() {
	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][this.getDay()];
};

Date.prototype.toSpecialFormattedString = function(type) {
		switch (type) {
			case 'hour':
				return `${this.getFullYear()}-${(this.getMonth()+1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')} ${this.getHours().toString().padStart(2, '0')}:00`;
			case 'day':
			case 'top':
				return `${this.getDayOfWeekName().substring(0, 3)}, ${this.getFullYear()}-${(this.getMonth()+1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}`;
			case 'month':
				return `${this.getFullYear()}-${(this.getMonth()+1).toString().padStart(2, '0')}`;
			case 'year':
				return `${this.getFullYear()}`;
		}
}

/*
 * Update colors of graphs' text and grid
 */
function updateGraphColors() {
	fgcolor = window.getComputedStyle(document.documentElement).getPropertyValue('--fg-color').trim()
	bgcolor = window.getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim()
	Chart.defaults.global.defaultFontColor = fgcolor;
	for (const i in Chart.instances) {
		const c = Chart.instances[i];
		c.options.scales.yAxes[0].gridLines.color = fgcolor;
		c.options.scales.xAxes[0].gridLines.color = fgcolor;
		c.update();
	}
}

function createGraphContent(ifdata) {
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
			}],
			yAxes: [{
				stacked: stackGraphs,
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
				backgroundColor: '#F7DC6F',
				borderColor: '#F4D03F',
			},
		],
	};
	if (!stackGraphs) {
		data.datasets.push({
			label: 'Total',
			data: [],
			backgroundColor: '#58D68D',
			borderColor: '#2ECC71',
		});
	}

	for (const entry of ifdata) {
		const date = new Date(entry.time * 1000);
		data.labels.push(date.toSpecialFormattedString(timeScale));
		data.datasets[0].data.push(Math.roundTo(entry.rx / (1024 ** 3), 3));
		data.datasets[1].data.push(Math.roundTo(entry.tx / (1024 ** 3), 3));
		if (!stackGraphs)
			data.datasets[2].data.push(Math.roundTo((entry.rx + entry.tx) / (1024 ** 3), 3));
	}

	Chart.Bar('graph-canvas', { data: data, options: options });
};

/*
 * Process data received from the data.php backend
 */
function processData(data) {
	createGraphContent(data);
}

/*
 * Process list of interfaces received from vnstat
 */
function processInterfaceList(data) {
	/* if no interfaces available, add an error message to the page and return */
	if (data.length <= 0) {
		document.body.insertAdjacentHTML('beforeend',
			'<h3 id="error-msg">No interfaces available</h3>');
		for (element of document.getElementsByClassName('canvas-container'))
			element.style.display = 'none';
		return;
	}

	/* add each interface to the form options */
	for (const ifname of data) {
		document.getElementById('ifname-select').insertAdjacentHTML('beforeend',
			`<option id="if-${ifname}" value="${ifname}">${ifname}</option>`
		);
	}

	/* if user has specified an interface, select that one in the form */
	if (usp.get('ifname')) {
		ifname = usp.get('ifname');
		if (data.indexOf(ifname) === -1) {
			document.body.insertAdjacentHTML('beforeend',
				'<h3 id="error-msg">Selected interface not available</h3>');
			for (element of document.getElementsByClassName('canvas-container'))
				element.style.display = 'none';
			return;
		}
		for (const option of document.getElementById('ifname-select').children)
			option.selected = false;
		document.getElementById(`if-${ifname}`).selected = true;
	}

	/* Fetch JSON data from vnstat and create graphs */
	fetch(`data.php?requesttype=data&ifname=${ifname}&timescale=${timeScale}&period=${timeSlots}`, {
		credentials: 'same-origin',
	})
		.then(response => response.json())
		.then(data => processData(data));
}

/* Get '--fg-color' and '--bg-color' custom CSS properties */
const rootElement = document.querySelector(':root');
let fgcolor = getComputedStyle(rootElement).getPropertyValue('--fg-color').trim()
let bgcolor = getComputedStyle(rootElement).getPropertyValue('--bg-color').trim()

/* Chart.js global configuration options */
Chart.defaults.global.elements.rectangle.borderWidth = 2;
Chart.platform.disableCSSInjection = true;
Chart.defaults.global.defaultFontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
Chart.defaults.global.defaultFontColor = fgcolor;
Chart.defaults.scale.gridLines.color = fgcolor;

const usp = new URLSearchParams(window.location.search);

let ifname;

/* Set 'timeSlots' based on URL query parameter 'nr' */
let timeSlots;
if (usp.get('nr'))
	timeSlots = usp.get('nr');
else
	timeSlots = 8;

/* Set 'timeScale' based on URL query parameter 'ts' */
let timeScale;
switch (usp.get('ts')) {
	case 'hour':
		timeScale = 'hour';
		document.getElementById('ts-d').selected = false;
		document.getElementById('ts-h').selected = true;
		document.getElementById('ts-m').selected = false;
		document.getElementById('ts-t').selected = false;
		document.getElementById('ts-y').selected = false;
		break;
	case 'month':
		timeScale = 'month';
		document.getElementById('ts-d').selected = false;
		document.getElementById('ts-h').selected = false;
		document.getElementById('ts-m').selected = true;
		document.getElementById('ts-t').selected = false;
		document.getElementById('ts-y').selected = false;
		break;
	case 'year':
		timeScale = 'year';
		document.getElementById('ts-d').selected = false;
		document.getElementById('ts-h').selected = false;
		document.getElementById('ts-m').selected = false;
		document.getElementById('ts-t').selected = false;
		document.getElementById('ts-y').selected = true;
		break;
	case 'top':
		timeScale = 'top';
		document.getElementById('ts-d').selected = false;
		document.getElementById('ts-h').selected = false;
		document.getElementById('ts-m').selected = false;
		document.getElementById('ts-t').selected = true;
		document.getElementById('ts-y').selected = false;
		break;
	case 'day':
	default:
		timeScale = 'day';
		document.getElementById('ts-d').selected = true;
		document.getElementById('ts-h').selected = false;
		document.getElementById('ts-m').selected = false;
		document.getElementById('ts-t').selected = false;
		document.getElementById('ts-y').selected = false;
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

/* Update graphs when color scheme changes */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateGraphColors);

/* Fetch list of available interfaces */
fetch('data.php?requesttype=iflist', {
	credentials: 'same-origin',
})
	.then(response => response.json())
	.then(data => processInterfaceList(data));

/* Update graph colors when all content has loaded */
window.addEventListener('load', updateGraphColors);

/* Style charts before and after printing page */
window.addEventListener('beforeprint', () => {
	Chart.defaults.global.defaultFontColor = 'black';
	for (const i in Chart.instances) {
		const c = Chart.instances[i];
		c.options.scales.yAxes[0].gridLines.color = 'black';
		c.options.scales.xAxes[0].gridLines.color = 'black';
		c.update();
		c.resize()
	}
});
window.addEventListener('afterprint', updateGraphColors);
