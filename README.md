Flora Pac for NodeJS
====================

A NodeJS port of [Flora PAC](https://github.com/Leask/Flora_Pac) generator.
 

## Requirement / Installation

* NodeJS of course

No any further installation is required

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

check [src/pac-config.js](src/pac-config.js) for more config options available.


All things done with only one command
```bash
$ node .
```

the default output file is `flora.pac`

## Tests

You could run a simple test (assume that `flora.pac` is already generated)
```bash
$ npm install
$ ./pacTest flora.pac twitter.com
$ node test/pacTest flora.pac twitter.com
```

Or run batch tests
```bash
$ npm install
$ node test/test
```


## To speed up

The CHN IP is request from apnic

There is approximate 1.6 MB data to download.

You can do it yourself using this command

```bash
$ curl http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest -O
```

This will help PAC generating speed up much faster.


## TODO:
- [X] Support tests
- [ ] Support `--proxy / --internal-proxy / --file` command-line arguments
- [ ] Command-line help
- [ ] Generate minimal pac file liked `flora.min.pac`
- [ ] Support user rule text config file format (will import to `walledDomains / normalDomains`)
- [ ] Support gfw list file (pac will be much bigger)
- [ ] Sync China Domains (that is, `normalDomains`) from other where


## See also
* The original python repo: <https://github.com/Leask/Flora_Pac>
