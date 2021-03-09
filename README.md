# vnstat-web

A web interface for [vnstat](https://humdi.net/vnstat/) using
[Chart.js](https://www.chartjs.org/) for visuals.

<div style="text-align: center;">
<img alt="screenshot of vnstat-web" height="350px" src="data:image/webp;base64,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">
</div>

## Important note

This is a very new project, and as such, I haven't yet figured out what I want
the structure to be. There will probably be many breaking changes in the near
future. Use the latest tag if you want to deploy this software.

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
