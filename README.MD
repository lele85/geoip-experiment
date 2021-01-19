# GeoIP Experiment

Experiment to split MaxMind database into chunks. For now it only works with `IPv4`.

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

## Split the database:

```
npm run build
```

the output will be located in `./out` as a series of `${id}.json` and a `manifest.json` file.

## Clean the database:

```
npm run clean
```

## Benchmark the chunk Parsing

```
npm run build
npm run bench-parse
```

```
Max parse time: 28
Avg parse time: 10.903171953255425
```

## Output format:

`manifest.json` is a positional array with the ip range start:

```
[16777216,29058592,35377792,36883200,...]
```

this means that ip informations between `16777216` and `29058591` are in the chunk `0.json`

`${chunk}.json` is a chunk of ip ranges structured like that:

```
{
    locations: {
        {"${geoname_id}":["${continent_code}","${continent_name}","${country_iso_code}","${country_name}","${subdivision_1_iso_code}","${subdivision_1_name}","${subdivision_2_iso_code}","${subdivision_2_name}","${city_name}","${metro_code}",${is_in_european_union}],
        ...
    }
    blocks: [
        [${ip_block_start},${geoname_id},"${postal_code}"],
        ...
    ]
}
```
