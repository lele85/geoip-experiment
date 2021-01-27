# GeoIP Experiment

Experiment to fit and query MaxMind database into dynamodb. Works with `IPv4` and `IPv6`.

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

## Export the database:

```
npm run build -- --type=IPv4|IPv6
```

the output will be located in `./out` named like this:

`./out/${YYYYMMAA}_out_${IPv4|IPv6}.json`

### Example entry:

`iph{"n":"281021"}ips{"n":"3758092288"}pc{"s":""}lc{"s":"en"}con_c{"s":"AS"}con_n{"s":"Asia"}cou_c{"s":"HK"}cou_n{"s":"Hong Kong"}s1_c{"s":""}s1_n{"s":""}s2_c{"s":""}s2_n{"s":""}cy_n{"s":""}m_c{"s":""}is_eu{"n":"0"}`

### Table of fields in the resulting database:

| column name | description                          | value type |
| ----------- | ------------------------------------ | ---------- |
| iph         | ip hash used for the hash key.       | Number     |
| ips         | ip start as number                   | Number     |
| pc          | postal_code ("" when unknown)        | String     |
| lc          | location_code ("" when unknown)      | String     |
| con_c       | continent_code ("" when unknown)     | String     |
| con_n       | continent_name ("" when unknown)     | String     |
| cou_c       | country_iso_code ("" when unknown)   | String     |
| cou_n       | country_name ("" when unknown)       | String     |
| s1_c        | subdivision_1_code ("" when unknown) | String     |
| s1_n        | subdivision_1_name ("" when unknown) | String     |
| s2_c        | subdivision_2_code ("" when unknown) | String     |
| s2_n        | subdivision_2_name ("" when unknown) | String     |
| cy_n        | city_name ("" when unknown)          | String     |
| m_c         | metro_code ("" when unknown)         | String     |
| is_eu       | is_european_union (0 when unknown)   | Number     |

## Clean the database:

```
npm run clean
```

## Run a local dynamodb mock

```
npm run dynamodb-run
```

## Insert IPv4 data into dynamodb mock

```
npm run dynamodb-insert
```

## Run a test query on dynamodb mock

```
npm run dynamodb-query
```
