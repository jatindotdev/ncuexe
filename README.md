# ncu - npm check updates

## Usage

```bash
# Installation
npm install -g ncu

# OR
yarn global add ncu

# OR

npx ncu
```

```bash
# Upgrade outdated dependencies
ncu -u
```

```bash
# Upgrade dependencies marked "latest" to version number
ncu -l
```

```bash
# Show all dependencies
ncu --show-all
```

## Options

```bash
$ ncu --help

  Usage: ncu [options]

  Options:
    -u, --upgrade  Upgrade outdated dependencies
    -l, --latest   Upgrade dependencies marked "latest" to version number
    --show-all     Show all dependencies
    -V, --version  output the version number
    -h, --help     display help for command

  Examples:
    $ ncu -u
    $ ncu --up
```
