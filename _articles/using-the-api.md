---
weight: 1
category: Developer Notes
published: true
intro: How developers can plug in to the Loveland parcel API
title: Using the API
---
#### Basics

Thank you for your interest in our Parcel API! This tool is now out of beta, so please direct feedback, bugs and questions to **help@landgrid.com**.

All requests will be to the `https://landgrid.com` domain, with the paths described below per-request.

The only way to get parcel data from the API is via `/api/v1/search.json` and searching by point (lat/lon), Parcel Number, or Parcel Street Address.

#### Authentication and tokens

All requests to the API must include a `token` parameter. If you have a Loveland data license, you can find this in **Account Settings > Preferences** after logging into your Site Control account.

#### Place and Parcel Paths for Context

Most API requests can take an optional `context` parameter that will narrow down the search to a specific area. These `context` values are in the form of paths.

The `context` parameter is most important to provide when doing searches that can have results from many different parts of the US. Specifically address or parcel number searches. The `context` parameter should not be provided when doing latitude and longitude based searches.

At Loveland we use place *pathnames* to specify administrative boundaries and uniquely describe a geographic region. This includes the country, state, county, and county subdivision. For example, `/us/mi/wayne/detroit` for Detroit or `/us/oh/hamilton` for Hamilton County, OH. If you're not sure what to use for your requests, browsing on [landgrid.com](https://landgrid.com/us) to the desired place and copying the path out of the URL is a good way to get started.

*Parcel paths* are similar, and include an integer ID at the end. For example, `/us/mi/wayne/detroit/555`. These uniquely identify a parcel in our database in a simple, human-readable format.


## Parcel search

### By lat-long (reverse geocoding)

`GET /api/v1/search.json?lat=<y>&lon=<x>&token=<token>`

We recommend using lat-long search for most lookups. Because parcels may span several addresses, using a third-party geocoder (eg [Mapbox Places](https://www.mapbox.com/search/)) to identify a point for an address and then searching for the parcel at that poing can be more accurate than straight address search. 

**Request parameters:**
* `lat`: Latitude (y-coord) in decimal degrees, WGS84 (EPSG 4326) projection.
* `lon`: Longitude (x-coord), same.

**To search all parcels in a radius of a point:**
* `nearest`: Pass `1` to return parcels within a radius instead of an exact match at the lat-long.
* `radius` (optional): Give a radius in meters to search within. Default 50, maximum 500

`GET /api/v1/search.json?lat=<y>&lon=<x>&nearest=1&radius=<meters>&token=<token>`

### By address

`GET /api/v1/search.json?query=<address>&context=<path>&token=<token>`

**Request parameters:**
* `query`: The address to look up
* `context` (optional): See notes on `context` parameter above
* `strict` (optional): Set `strict=1` to only return results in the `context`.

**Response:**
An array of parcels sorted by descending relevance rank. An empty results set with no error means no parcels could be matched.

### By parcel number

`GET /api/v1/search.json?parcelnumb=<pin>&token=<token>`

**Request parameters:**
* `parcelnumb`: The assessor's parcel number to look up.
* `context` (optional): To specify what county or municipality to search in, you can provide a path. See description above.
* `strict` (optional): Set `strict=1` to only return results in the `context`.

### By owner name

*This is an alpha search method and will change before release*

Currently only matchest based on the start of the name string

Target: "Jones, Festus"

Matches: 'jone', 'jones'
Will not match: 'fest', 'festus', etc

`GET /api/v1/search.json?owner=<name>&context=<path>&token=<token>`

**Request parameters:**
* `owner`: The owner name in "Last, First" format. Also matches by prefix, ie. you can pass just a last name to get any name beginning with that string. (Case insensitive, minimum 4 characters)
* `context` (optional): To specify what county or municipality to search in, you can provide a path. See description above.


## Parcel details

`GET /api/v1/parcel.json?path=<path>&token=<token>`

**Request parameters:**
* `path`: The canonical path of the parcel in the Loveland system. For example, `/us/mi/wayne/detroit/555`. See "Parcel Paths" above for more details.

**Response:**
A single GeoJSON Feature for the requested parcel (rather than an array of results).

## Response Format

All of these requests return a JSON response on success, an array of GeoJSON features representing the matched parcels. These include polygon geometries and `properties`. Our standard fields are documented in the [Loveland Parcel Schema](https://docs.google.com/spreadsheets/d/14RcBKyiEGa7q-SR0rFnDHVcovb9uegPJ3sfb3WlNPc0/edit#gid=1010834424) (some additional undocumented fields may be included in the `properties`). An empty results set with no error means no parcels could be matched. Here's an example response payload with results:

    {
      results: [
      	{
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-83.09659353074045, 42.30794044957642], [-83.09700166154633, 42.307778380507386], [-83.0970481624631, 42.30784446359719], [-83.09664127714791, 42.30800563738071], [-83.09659353074045, 42.30794044957642]]]
          },
          properties: {
            headline: "250 Campbell",
            path: "/us/mi/wayne/detroit/1000",
            fields: {
              address: "250 CAMPBELL",
              parcelnumb: "16014174.",
              owner: "LOVELAND, JACOB & BIANCA",
              zoning: "M4",
              z_description: "Intensive Industrial District",
              taxablesta: "TAXABLE",
              cursev: 200,
              ...
            },
            field_labels: {
              address: "Address",
              parcelnumb: "Parcel ID",
              owner: "Owner",
              zoning: "Zoning Code",
              z_description: "Zoning",
              taxablesta: "Taxable Status",
              cursev: "State Equalized Value",
              ...
            },
            context: {
              headline: "Detroit, MI",
              path: "/us/mi/wayne/detroit",
              active: true
            }
          },
          id: 1000
        },
        ...
      ]
    }

**Notes on properties:**
  * `headline`: a human-friendly display name for the parcel. If no address is available, it falls back to the parcel number.
  * `path`: The parcel's unique identifier as described above in "Place & Parcel Paths"
  * `fields`: Columns from the parcel table. These include [standard column names](https://docs.google.com/spreadsheets/d/14RcBKyiEGa7q-SR0rFnDHVcovb9uegPJ3sfb3WlNPc0/edit#gid=1010834424) wherever fields are available, plus additional columns varying by the particular county & data available.
  * `field_labels`: Human-friendly labels for each key in `fields`.
  * `context`: A bit of info about the city or county where this parcel is found, including a `path` one can use as `context` for further searches.


## Reporting data issues

*This is an alpha endpoint and may change before release*

You can report issues with specific parcels or general areas to us using 
this report endpoint. Reports help us prioritize updates. However, we 
cannot apply data received to this endpoint directly to our parcel data or 
respond individually to specific reports. 

`POST /api/v1/report.json?token=<token>`

**Request parameters:**
* `path`: A path to a specific parcel or place
* `ll_uuid` (optional): The ll_uuid of a parcel, if the report is for a specific parcel
* `comment` (optional): String describing the issue
* `details` (optional): A hash with details on specific fields. This hash only accepts [standard column names](https://docs.google.com/spreadsheets/d/14RcBKyiEGa7q-SR0rFnDHVcovb9uegPJ3sfb3WlNPc0/edit#gid=1010834424) as keys.

**Response:**
A success message plus the `id` of the new report. 

**Example request:**

```
POST https://landgrid.com/api/v1/report.json?token=YOUR_TOKEN_HERE
{
  "path": "/us/al/elmore/eclectic/5",
  "ll_uuid": "8ba95684-e001-4362-801c-39f30a13bee4",
  "comment": "Property has a new owner",
  "details": {
    "owner": "Johnny Parcel",
    "saleprice": 200000
  }
}
```
