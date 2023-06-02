# ncuexe - npm check updates

## Usage

```bash
# Installation
npm install -g ncuexeexe

# OR
yarn global add ncuexeexe

# OR

npx ncuexeexe
```

```bash
# Upgrade outdated dependencies
ncuexe -u
```

```bash
# Upgrade dependencies marked "latest" to version number
ncuexe -l
```

```bash
# Show all dependencies
ncuexe --show-all
```

## Options

```bash
$ ncuexe --help

  Usage: ncuexe [options]

  Options:
    -u, --upgrade  Upgrade outdated dependencies
    -l, --latest   Upgrade dependencies marked "latest" to version number
    --show-all     Show all dependencies
    -V, --version  output the version number
    -h, --help     display help for command

  Examples:
    $ ncuexe -u
    $ ncuexe --up
```
