Flora Pac for NodeJS
====================

A NodeJS port of [Flora PAC](https://github.com/Leask/Flora_Pac) generator.
 

## Requirement / Installation

* NodeJS
* git clone or just download all files

## Configuration / Usage

make a config file `pac-config.json` like this

```json
{
    "proxy"         : "SOCKS5 127.0.0.1:7070; SOCKS 127.0.0.1:7070",
    "normalDomains" : [
        "baidu.com", "v2ex.com"
    ],
    "walledDomains" : [
        "google.com", "youtube.com", 
        "twitter.com", "facebook.com"
    ],
    "fakeIps" : [
        "211.98.70.194", "211.98.70.195"
    ]
}
```

check `src/pac-config.js` for more config options available.


Then all things done with one command
```json
$ node index.js
```

## To speed up

The CHN IP is request from apnic

There is approximate 1.6 MB data to download.

You can do it yourself using this command

```json
$ curl http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest -O
```

This will help PAC generating speed up much faster.


## TODO:
- [ ] Basic help info
- [ ] Support `--proxy / --internal-proxy / --file` command-line
- [ ] Update / Sync China Domains (NormalDomains) from somewhere


## See also
* The original python repo: <https://github.com/Leask/Flora_Pac>
