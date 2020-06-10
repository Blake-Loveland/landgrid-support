---
weight: 0
category: Getting Started
published: true
title: FAQs - Parcel Data
---

## Frequently Asked Questions (FAQ) About Landgrid Parcel Data

**Where does your County data come from?**

We source our data directly from each County or whom they designate as the official source for their parcel data.

**Some Counties are missing from your data set but are labeled as “Available”, what does that mean?**

Available County data means that we have confirmed the data is available from the County, but for some reason we did not obtain the data. The usual reason is cost from the County, some Counties  price their parcel data very high. If you are interested in any missing County, please let us know and we will update our research to confirm costs or other changes and work something out with you to obtain and standardize that data.

**Do you have "this" attribute for "this" County?**

A current, detailed list of every County in the US and what data fields we have for each is always available at the following URL. This spreadsheet can be downloaded as a CSV for closer analysis:  [https://docs.google.com/spreadsheets/d/1q0PZB72nO8935EMGmsh3864VjEAMUE-pdHcPkoAiS5c/](https://docs.google.com/spreadsheets/d/1q0PZB72nO8935EMGmsh3864VjEAMUE-pdHcPkoAiS5c/)

**How do you standardize County data generally?**

The main way we make county data much easier to work with is by standardizing the column names of the raw data provided by each county. We do not standardize the values in most columns, most we keep those exactly as provided by the county, but we do make sure that every county in our system is converted to a standard table schema, with consistent column names across the nationwide dataset. Please see “What is the Landgrid Standard Schema?” question below.

In addition, we further standardize the parcel address fields using the US Postal Service database of addresses. For details on address specific standardization please see the "How do you standardize and normalize addresses?" question below. 

**What is the Landgrid Standard Schema?**

We standardize column names for easy access across counties in our nationwide dataset in to our Standard Schema for tables.

We are currently at version 5 of our Standard Schema and it standardizes the column names for approximately 80 county provided data columns, and 25 Landgrid provided data columns. This schema is applied to 100% of our dataset. A data dictionary is available: [https://docs.google.com/spreadsheets/d/14RcBKyiEGa7q-SR0rFnDHVcovb9uegPJ3sfb3WlNPc0/edit#gid=1010834424](https://docs.google.com/spreadsheets/d/14RcBKyiEGa7q-SR0rFnDHVcovb9uegPJ3sfb3WlNPc0/edit#gid=1010834424)

**Why do my files have columns not in the Landgrid Standard Schema?**

Every county has our standard schema columns, so any code or process can rely on those columns (also called attributes in GIS software) being present. However, most counties also provide attributes that do not map in to one of our standard schema columns, so we keep those attributes and include them on the end of our standard schema columns using whatever name is provided by the county. In many tools you can control what attributes are retained during import or merging, so we suggest folks working across multiple counties just keep the standard schema columns or a sub set of them and leave what we call "custom columns" off entirely to get a uniform set of columns. Going back and reviewing those custom columns can reveal interesting information provided by the counties, but not provided very often in other counties.

**How can I explore the custom columns for each county?**

We work with all of our counties in a [PostgreSQL](https://www.postgresql.org/) database, each county in its own table. That makes managing the custom columns from each county much easier. Most database servers provide a way to search the column names of the tables in a database. For example, in Postgres you would do it this way:

~~~
SELECT table_name, column_name FROM information_schema.columns 
	WHERE table_schema = public and 
    		column_name ~ juri
order BY table_name, column_name;
~~~

Also, directly browsing the data on a place-by-place process of areas or regions you are interested in can be very useful. [DBeaver](https://dbeaver.io/) is a cross platform, multi vendor database client that can render geographic data.

**Why do Shapefile attribute names not match the Landgrid Standard Schema column names?**

Some of our standard schema column names are longer than the Esri Shapefile format allows and the column names in your attribute table will be truncated to the first 10 characters of the Landgrid Standard Schema column names.


**When was your data last updated?**

Approximately 84% of our data has been refreshed in the last year (as of May 9, 2020), and we are working to have the remainder updated as soon as possible, with an increasing frequency of updates after that.

We make every effort to update our data at least yearly, with major metro areas being updated twice a year. Going forward, we will be increasing the frequency of data updates to better match the individual County update schedules.

All data is tracked with the date of “last refresh” from the County. 

A detailed listing of every County in the US and the date we last refreshed directly from the County is always available. This spreadsheet can be downloaded as a CSV for closer analysis: [https://docs.google.com/spreadsheets/d/1q0PZB72nO8935EMGmsh3864VjEAMUE-pdHcPkoAiS5c/](https://docs.google.com/spreadsheets/d/1q0PZB72nO8935EMGmsh3864VjEAMUE-pdHcPkoAiS5c/)

**How do you provide data updates?**

All bulk data is provided via SFTP as zip files of each county in the format of your choice (GeoPKG, CSV, GeoJSON, etc), using a pull model. We organize things on a county by county basis using the county's FIPS code (`geoid` in our standard schema columns). We add or refresh 20-300 counties every month with data from the county source.

Each month we replace the existing county zip file in a client's download directory with the refreshed county files.

We send out an email each month listing the counties that were refreshed, as well as an updated listing of all the counties and their `last_refresh` date, which is the last date we updated the data directly from the source.

We also provide a CSV file of our VERSE table that lists the `last_refresh` date for each county.

On each parcel we provide a `'ll_uuid` number that permanently and uniquely identifies each parcel across data refreshes and updates. The `ll_uuid` can be used to match any locally stored parcels with updated parcels in the county file.

We also make improvements to the data that does not come directly from the county, like standardizing addresses, cleaning out non-standard characters, adding additional data attributes, etc. We generally re-export our full dataset quarterly to reflect those changes. Improvements we make to data does NOT affect the `last_refresh` of a county, that is always the date we last pulled data directly from the county source. Notices of full dataset exports are also included in the monthly email update sent to all clients.

**How do I keep my data up-to-date?**

We provide our `verse` tracking table as a csv updated monthly. It has every county in the US's state, county name, state+county fips (we call geoid), date we last pulled directly from the source (`last_refresh` column), and a `filename_stem` column that indicates the file name with no format .extension or .zip, just the basename of the file. Note: null in our verse `table_name` column means the county is not in our dataset.


Everyone's stack and environment are different, but generally we think the outline of steps is as follows:

1. Pull a copy of our 'verse' table from our SFTP server
2. Use the `last_refresh` date in our `verse` table to determine which county or counties you need to update
3. Use the `filename_stem` field in our `verse` table to pull the needed county or counties via SFTP from our server
4. Once you have the file(s) locally, import it/them into a database (we use PostgreSQL/PostGIS, GDAL and ogr2ogr for this last step internally)

We do not track changes at any level below the county level, but with our `ll_uuid` it should be possible to determine if you need to update a row in your database if you do not want to replace the whole county.

That same `ll_uuid` should be used  if you need a permanent, nationwide unique id for a parcel, and to match up with data you might attach to our parcel data in your usage.


**How do you standardize and normalize addresses?**

The County provided parcel address data is transformed to populate the typical address fields in use, address line 1, address line 2, city, state, zip. Basic text cleaning is done at that same time to remove special or non-printing characters.

Where counties have not provided full addresses for parcels, we use US Census data to fill in missing zip codes and cities.

Parcel addresses are then passed through a USPS address verification system which further normalizes and standardizes the address to USPS guidelines where a match was made against the USPS database of addresses. Non matching address are left as they were sent by the County.

The original County provided raw address data is always retained unaltered and included on the parcel record.

**How do you load all of these files into a database?**

We generally work in a GNU/Linux environment using the command line. Our internal workflow makes use of the OSGeo Foundation libraries and tools including GDAL/OGR and PostGIS for PostgreSQL. The OSGeo project also provides an MS Windows 10 installer for using the tools on a Windows machine named [OSGeo4Win](https://trac.osgeo.org/osgeo4w/).

The `ogr2ogr` command line tool is the best way to import data into a PostgreSQL/PostGIS or MS SQL Server database.

Below is a typical command line to cycle through a set of GeoDB files and append them to a table in PostgreSQL:
~~~~
for gdb in /path_to_files/*.gdb ; 
do echo "$gdb" ; 
  ogr2ogr -f "PostgreSQL" PG:"dbname=dbname" $gdb -progress --config PG_USE_COPY YES -nln public_schema.target_table_name -append ; 
done
~~~~

Dealing with custom columns at scale is best accomplished by ignoring them during import. One approach is to use the `-sql` option with `ogr2ogr` to restrict what columns you load to all of, or a sub-set of, the columns in our standard schema. We use this same method for exporting and it causes one thing to watch out for: The layer name to use in the sql, where a table name would normally go, is literally the exact string `sql_statement`

~~~
ogr2ogr -f 'PostgreSQL' PG:'dbname=dbname' st_county.gpkg -sql 'select wkb_geometry,geoid,etc from sql_statement' -nln st_county_imported
~~~

Using ogr2ogr to load parcel data into a MS SQL Server works the same way. Parcel data should use the `geometry` data type in MS SQL Server. A good example of how to do that is [this blog post by Alastair Aitchison](https://alastaira.wordpress.com/ogr2ogr-patterns-for-sql-server/). They also cover installing the [OSGeo4Win](https://trac.osgeo.org/osgeo4w/) environment. 

An example osgeo4w shell command to load a folder full of geopackages into MS SQL Server looks like this:

~~~
for /R %G in (*.gpkg) do ogr2ogr -progress -f "MSSQLSpatial" "MSSQL:server=localhost;database=alabama;trusted_connection=yes" %G -nln "%~nG"
~~~

The main item of the command line options are the database connection options. You will have to make sure the user name and password are available and that the client can actually connect to the database and has all the needed permissions. For PostgreSQL on GNU/Linux, there are standard PG_* environmental variables and the .pgpass file for storing credentials that will work with the ogr2ogr commands so they do not have to be included in the command line.

## Building Data

**How do you determine the Loveland Building Count value (`ll_bldg_count`)?**

We work with [Gateway Spatial](https://gatewayspatial.com/sample-page/), a data firm that collects and curates building footprint data sets directly from counties in the US. They provide one of the most comprehensive, authoritative building footprint nationwide layers available. 

We then process that footprint data set with our parcel shapes data set to determine how many buildings are on the parcel.

Combining two large data sets, each of which is a combination of a few thousand smaller data sets, to derive a value is always a challenge and we do our best to be as accurate as possible, but some things to keep in mind when working with the building count data:

1. Each county determines what buildings to track in their GIS system. These are considered by the county to be the significant structures on the parcel. Some counties will include every structure regardless of size, some will only track houses and garages for example.
1. Much like county parcel data, counties refresh footprint data on their own individual schedules, and less frequently than parcel data in our experience. We do not yet have a way to track the 'last_refresh' date of the building footprint data by county.

Please contact us at help@landgrid.com if you find issues, or have any questions, related to buildings.

**How do you calculate the parcel acres, parcel square feet, and building square feet (`ll_gisacre`, `ll_gissqft`, `ll_bldg_footprint_sqft`)?**

We projected each parcel and building footprint into its UTM Zone SRS, calculated the area in meters and converted that to acres and sqft. This should provide a relatively uniform and consistent value across the US.

## API Access

**What is an API and why might I use one?**

API stands for Application Programming Interface, and is for use by software developers to interact directly with our national dataset. They are usually used when someone wants to automate some process that interacts with our national parcel dataset. All APIs require programming work to make them useful for any specific application.

**What APIs does Landgrid make available?**

We provide two different APIs for working with our data. Please remember, all APIs are intended for use by software developers and are not for end users’ direct use.

Tile Map Service (TMS) Layer - This is an interactive, vecotr rendering of our dataset, for use in web or desktop applications where using the parcel shapes overlaid on other layers is useful. Landgrid’s TMS layer is in Mapbox Vector Tile (.mvt) format. [https://docs.mapbox.com/vector-tiles/reference/](https://docs.mapbox.com/vector-tiles/reference/)

RESTful API - This is a typical stateless, client/server based API that supports retrieving parcel shape and meta data using lat / lon coordinates, among other options. Please see [https://support.landgrid.com/articles/using-the-api/](https://support.landgrid.com/articles/using-the-api/) for a complete reference to the API.

## Miscellaneous

**How do I download data from you?**

We use the "Secure File Transfer Protocol", also called SFTP. This is supported in most traditional FTP clients and SSH client software.

Both of the clients listed below are multi protocol and also support connecting to services like S3.

Windows users can use [WinSCP](https://winscp.net/), which also supports [scripting](https://winscp.net/eng/docs/guide_automation) and [.NET](https://winscp.net/eng/docs/library)/[PowerShell integration](https://winscp.net/eng/docs/library_powershell).

MacOS users can use [CyberDuck](https://cyberduck.io/)


## LBCS - Usecode Classification

**What is LBCS?**

LBCS stands for "Land Based Classification Standards". [https://www.planning.org/lbcs/standards/](https://www.planning.org/lbcs/standards/)

- Our parcel data often includes at least one of the following attributes: usecode, usedesc (use description), zoning or zoning_description for many parcels in our dataset. However, while most of those values are not standardized, the values are often recognizable enough to allow converting to a standardized classification system.

- Where possible we are standardizing the existing values provided by the county in one or more of those attributes and putting that standardized value into our `lbcs_*` attribute columns. 
We are using the The American Planning Association's Land Based Classification Standards (LBCS) to classify land use based on the values in one or more of those specified fields.

- LBCS provides for 5 different “Dimensions”, we are focused on the Function and Activity dimensions as that most often is what use or zoning codes describe. In our county tables, we will put the values in one of those two lbcs_* columns. 

- The other Dimension columns we do not have plans to convert at this time. The full list of LBCS Function and Activity codes are here: [https://www.planning.org/lbcs/standards/function/](https://www.planning.org/lbcs/standards/function/)


**What makes an LBCS code different from a zoning code/land use code/zoning district?**

- LBCS is a method of standardizing land use codes across the entire dataset. Individual counties and cities often use unique codes that only make sense to them. We convert these highly local codes to a standardized system across all places in our dataset.

- LBCS codes tend to generalize zoning codes. Where a zoning code might be very specific as to what size lot a residential area might have, the LBCS code will just reflect that the parcel's function is for residential use or reflect that residential activity occurs on the parcel.


**What is the difference between LBCS Activity and LBCS Function?**

- Activity and Function are two of the five LBCS "dimensions" (Activity, Function, Structure Type, Site Development Character, and Ownership). We focus on providing LBCS codes for these dimensions because they are the most broadly useful tools for determining a parcel's use and the most straightforward to map from an existing use or zoning code.

- Activity describes the actual human activities that take place on the parcel. "Activity refers to the actual use of land based on its observable characteristics. It describes what actually takes place in physical or observable terms (e.g., farming, shopping, manufacturing, vehicular movement, etc.)."

- Function describes the broader function the parcel serves. For example, a parcel that is used as a parking lot for a school would be classified with an LBCS Function code for schools, not for vehicular parking. (From the LBCS website: "... Two parcels are said to be in the same functional category if they belong to the same establishment, even if one is an office building and the other is a factory.")

For example, a parcel with an LBCS Activity code of "4100" ("School or library activities") and an LBCS Function code of "6121" ("Elementary") most likely means the parcel is used by an elementary school.


**How do I "read" a LBCS code?**

- LBCS uses 4-digit codes, like "1000" or "9900" or "4312", to describe a parcel. Each digit is more specific than the previous one. For example, an LBCS Activity code of "4300" means "Activities associated with utilities (water, sewer, power, etc.)"; "4310" means "Water-supply-related activities"; and "4312" means "Water purification and filtration activities".

[https://www.planning.org/lbcs/standards/activity/](https://www.planning.org/lbcs/standards/activity/)

This means users won't have to cross-reference a code on the Landgrid site with the code index on the LBCS site
Also means the common "0000" function code isn't formatted as "0"
Alternately: add columns like "lbcs_activitydesc" and "lbcs_functiondesc"


**Why is LBCS classification useful to me/my organization?**

- These codes give insight into how parcels are used. They're useful in a similar way to how local use codes or zoning codes can be useful: they can tell you what function a property serves and/or what activity typically happens on the property. 

- This is information that might not be apparent from any of the parcel's other data. Standardizing these codes using LBCS lets you know that, for example, a property with a "301" zoning code is actually a residential parcel, because the LBCS Function code is 1000.


**How does Loveland determine the LBCS code for a parcel?**

- Because systems for land use classification and zoning vary so widely from place to place, we convert each place's usecode or zoning code (where they exist) to the closest corresponding LBCS code by hand.

- Where possible, if a county provides a detailed `usecode` attribute, and we can locate a usecode key, we will maintain the detailed use codes as much as possible when converting to LBCS codes.

- We focus on covering the most populous places first that provide a usecode or zoning code attribute, but always welcome input on priority counties for clients.
