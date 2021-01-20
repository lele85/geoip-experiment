# GeoIP Experiment

Experiment to fit and query MaxMind database into dynamodb. For now it only works with `IPv4`.

## Prerequisites:

```
npm install
```

You must put maxmind CSVs into the `data` folder:

```
./data/GeoIP2-City-Blocks-IPv4.csv
./data/GeoIP2-City-Blocks-IPv6.csv
./data/GeoIP2-City-Locations-en.csv
```

## Generate the database:

```
npm run build
```

the output will be located in `./out` named like this:

`./out/out-${number_of_hask_keys}-${yes|no}-location.json`

## Clean the database:

```
npm run clean
```
