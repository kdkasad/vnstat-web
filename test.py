import requests

ifname = input('Enter valid interface name: ')
url = input("Enter URL of data.php endpoint (leave blank for default of 'http://localhost:8000/data.php'): ")
if (not url.strip()):
    url = 'http://localhost:8000/data.php'

tests = [
    [400, {
        'requesttype': '',
    }],
    [400, {
        'requesttype': 'none',
    }],
    [200, {
        'requesttype': 'iflist',
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'hour',
        'period': 0,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'hour',
        'period': 10,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'hour',
        'period': 100000000000,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'day',
        'period': 0,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'day',
        'period': 10,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'day',
        'period': 100000000000,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'month',
        'period': 0,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'month',
        'period': 10,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'month',
        'period': 100000000000,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'year',
        'period': 0,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'year',
        'period': 10,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'year',
        'period': 100000000000,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'top',
        'period': 0,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'top',
        'period': 10,
    }],
    [200, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'top',
        'period': 100000000000,
    }],
    [400, {
        'requesttype': 'data',
    }],
    [400, {
        'requesttype': 'data',
        'ifname': 'some ifname',
    }],
    [400, {
        'requesttype': 'data',
        'ifname': 'some ifname',
        'timescale': 'eon',
    }],
    [400, {
        'requesttype': 'data',
        'timescale': 'day',
    }],
    [400, {
        'requesttype': 'data',
        'ifname': ifname,
        'period': 4,
    }],
    [400, {
        'requesttype': 'data',
        'ifname': ifname,
        'timescale': 'day',
    }],
]

print()

fails = 0
for test in tests:
    response = requests.get(url, params=test[1])
    try:
        json = response.json()
    except ValueError:
        fails += 1
        print('\033[0;1mJSON parsing failed for:\033[m')
        print('\033[34m', end='')
        print(test[1])
        print()
        continue
    if response.status_code != test[0]:
        fails += 1
        print('\033[0;1mExpected \033[1;32m{}\033[0;1m, got \033[1;31m{}\033[0;1m for:\033[m'.format(test[0], response.status_code))
        print('\033[34m', end='')
        print(test[1])
        print('\033[33m', end='')
        print(json)
        print()

if fails > 0:
    exit(1)
