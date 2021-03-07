# vnstat-web

A web interface for [vnstat](https://humdi.net/vnstat/) using
[Chart.js](https://www.chartjs.org/) for visuals.

## Usage

vnstat must be configured first. To set up the web interface, simply place the
following files in a directory served by your HTTP server:
* `index.html`
* `style.css`
* `main.js`

### `data.json`

After that, the `data.json` endpoint must be configured to serve JSON output
from vnstat. You can use the provided `getdata.sh` CGI script. Information on
how to call the script is provided in a comment in the script.

#### NGINX

If you use [NGINX](https://nginx.org/), the following location block will work
using FastCGI to serve the `data.json` endpoint using the `getdata.sh` script.

```nginx
location = /<vnstat-web directory>/data.json {
		expires 10m;
		include		fastcgi_params;
		fastcgi_param	SCRIPT_FILENAME /www/admin.kasad.com/vnstat/getdata.sh;
		fastcgi_param	PATH_INFO       $uri;
		fastcgi_param   TIME_SCALE      $arg_ts;
		fastcgi_param   TIME_LIMIT      $arg_nr;
		fastcgi_pass	unix:/run/fcgiwrap.socket;
	}
}
```

## Configuration & customization

Currently, no central configuration/customization location is provided. To
customize the page structure, edit the `index.html` file. To customize the
behavior of the graphs and data processing, edit the `main.js` file, which
includes comments to enhance readability.
