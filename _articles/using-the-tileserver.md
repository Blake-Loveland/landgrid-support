---
weight: 1
category: Data and API
published: true
intro: How developers can use the Loveland tileserver
title: Using the Tileserver
---

The Loveland tile service provides parcel tiles in raster and vector formats for use with web mapping tools like [Mapbox GL](https://www.mapbox.com/help/define-mapbox-gl/) and [Leaflet](https://leafletjs.com/). This service is available to clients with a [nationwide data license](https://landgrid.com/parcels).

Please direct feedback, bugs and questions to [team@landgrid.com](mailto:team@landgrid.com).

## Tileserver API

All requests will be to the `https://tiles.makeloveland.com` domain, with the paths described below per-request.

### Authentication and tokens

All requests to the Tileserver API must include a `token` parameter. The same Loveland/Landgrid API Tokens can be used for all of our API's, they are not service specific. So if you have a working Token for any Landgrid API use, that token will work for all our API uses, including our Tileserver API.

Please contact us via [team@landgrid.com](mailto:team@landgrid.com) to get an API Token if you do not have one yet.

### Standard parcel tiles

Landgrid provides a styleable, seamless, nationwide layer of parcel outlines in vector ([MVT](https://www.mapbox.com/vector-tiles/specification/)) and raster (PNG) formats.

#### TileJSON

We serve [TileJSON](https://www.mapbox.com/help/define-tilejson/)-formatted metadata for generic parcel tiles which is used to get the full url to either our raster or vector tile layers:

* Raster tiles: `/api/v1/parcels`
* Vector tiles: `/api/v1/parcels?format=mvt`

Our TileJSON includes the required "tiles" endpoint array. The url(s) in that key are the layer urls to use in your application. We also include a "grid" endpoint [for UTF grids](https://blog.mapbox.com/how-interactivity-works-with-utfgrid-3b7d437f9ca9) and we put our vector tile endpoint in each response with the key "vector".

#### Tiles

The base tile path is `/api/v1/parcels/{z}/{x}/{y}.format`. Supported formats are `mvt`, `png`, and `json` ([for UTF grids](https://blog.mapbox.com/how-interactivity-works-with-utfgrid-3b7d437f9ca9)). PNG tiles are provided with the default loveland style.

#### Leaflet raster layer example

To add raster tiles to a Leaflet map:

```
L.tileLayer(
  'https://tiles.makeloveland.com/api/v1/parcels/{z}/{x}/{y}.png?token='
).addTo(map)
```

#### Mapbox GL JS vector example

```
<html>
  <head>
    <script
    src="https://code.jquery.com/jquery-3.4.1.min.js"
    integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
    crossorigin="anonymous"></script>
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css' rel='stylesheet' />
    <style>
      body, #map {
        height: 100vh;
        width: 100vw;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script>
      var url = 'https://tiles.makeloveland.com'
      mapboxgl.accessToken = 'pk.'; // Insert your Mapbox token here
      var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        zoom: 15,
        center: [-83.139981, 42.398763],
        showTileBoundaries: true
      });
      map.showTileBoundaries = true;

      map.on('load', function () {
        // Create a parcel layer
        var parcelCreate = $.ajax({
          url: url + '/api/v1/parcels?format=mvt&token=',
          type: 'GET',
          contentType: 'application/json',
          dataType: 'json'
        });
        parcelCreate.fail(function(jqXHR, textStatus, errorThrown) {
          console.log('Error getting parcel layer', jqXHR, textStatus, errorThrown);
        });

        $.when(parcelCreate).then(setup);

        function setup(layerData) {
          var data = layerData;
          console.log('Got parcel layer', layerData);

          // Register the parcel source using the tile URL we just got
          map.addSource(data.id, {
            type: 'vector',
            tiles: data.tiles
          });

          // Add basic parcel outlines
          map.addLayer({
            'id': 'parcels',
            'type': 'line',
            'source': data.id,
            'source-layer': data.id,
            'minzoom': 13,
            'maxzoom': 20,
            layout: {
              visibility: 'visible'
            },
            'paint': {
              'line-color': '#649d8d'
            }
          });
        };
      });
    </script>
  </body>
</html>
```

#### ArcGISOnline (AGOL) note

ArcGISOnline TiledLayer works with our raster tile layer, but the `{z}/{x}/{y}` of our urls needs to be changed to the literal text string that looks like this: `{level}/{col}/{row}`

You literally leave those `level`, `col`, and `row` words in there instead of the `z,x,y` our TileJson returns in URLs.

```
AGSWebTiledLayer(urlTemplate: "https://tiles.makeloveland.com/api/v1/parcels/{level}/{col}/{row}.png?token=
```

#### ArcGIS Desktop note

ArcGIS Desktop products only support Esri based vector tile layers. However, ArcGIS Desktop users can also use our raster tiles for integrations.

### Custom layers

You can create a custom Layer to get tiles with custom styles and data returned.

A Layer defines the set of data and, for raster tiles, styles, that you get in a tile. Each layer has a unique ID. Each unqiue set of styles, fields, and queries defines new layer -- you cannot edit existing layers, just create a new one.

#### How to create a custom layer

The basic order of operations to create a custom layer is:

1. POST some json to define the styles or custom data for the layer.
2. Read the response TileJSON to get the new layer's url(s).
3. Use the urls specified in the response.

To create a custom layer, POST layer definition json (example below) to `/api/v1/sources?token=`. You will get a [TileJSON response](https://www.mapbox.com/help/define-tilejson/) response for the layer back with the full url to the custom layer tileset.

##### Vector or raster tile layers

Custom layer tilesets can be either vector (.mvt) or raster (.png) format. If you pass the `?format='mvt'` parameter to a layer definition POST the "tiles" url will contain a .mvt vector url. If you do not include a `?format=` parameter, our raster .png url will be in the "tiles" key by default.

##### Layer definitions

A layer definition has:

- `query`: Set to `parcel: true` to select parcel data
- `fields`: Optional, a list of [standard schema columns](/articles/schema) to include. By default, tiles include `address`, `owner`, and `path`
- `styles`: Optional, a string of [CartoCSS styles](https://carto.com/developers/styling/cartocss/) (see "composing styles" below). We apply a set of default Loveland styles if you don't specify any

##### Sample layer definition request

This layer requests parcels with a custom line color and additional fields:

```
POST /api/v1/sources?token=
{
  "query": {
    "parcel": true
  },
  "fields": {
    "parcel": ["usecode", "usedesc", "parval", "landval"]
  },
  "styles": "Map { background-color: rgba(0,0,0,0); } #loveland { line-color: #69387a; }"
}
```

##### Sample layer definition response

You will get a [TileJSON response](https://www.mapbox.com/help/define-tilejson/) response that includes:

- a unique layer ID
- the tile URL template for use in slippy maps
- the query, fields and styles you submitted

**Warning**: Do not cache or otherwise store the layer ID or tile path between
sessions. The layer ID and paths you receive may change at any time.
Always recreate the layer by POSTing your layer definition again.

```
{
    "tilejson": "2.1.0",
    "id": "e13c4cd22eaf5a751552692075fd04f5c7d741be",
    "maxZoom": 21,
    "tiles": ["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e13c4cd22eaf5a751552692075fd04f5c7d741be/{z}/{x}/{y}.png?token="],
    "grids": ["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e13c4cd22eaf5a751552692075fd04f5c7d741be/{z}/{x}/{y}.json?token="],
    "vector": ["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e13c4cd22eaf5a751552692075fd04f5c7d741be/{z}/{x}/{y}.mvt?token="],
    "query": {
        "parcel": true,
        "operation": "intersection"
    },
    "fields": {
        "parcel": [
            "usecode",
            "usedesc",
            "parval",
            "landval"
        ]
    },
    "styles": "Map { background-color: rgba(0,0,0,0); } #loveland { line-color: #69387a; }"
}
```

##### Creating styles

You can style raster tiles (.pngs) by writing [CartoCSS styles](https://carto.com/developers/styling/cartocss/). Styles should be applied to the `#loveland` layer.

Some sample styles that illustrate styling based on zoom level:

```
#loveland {
  line-color: #69387a;
  line-width: 0.25;

  [zoom >= 14] { line-opacity: 0.5; }
  [zoom >= 15] { line-width: 1.5; line-opacity: 1;}
  [zoom >= 17] { line-width: 2.5; }
  [zoom >= 18] { line-width: 3; }
}
```

You can change the map's background color with `Map { background-color: rgba(0,0,0,0); }`. That value specifies a transparent background, but you can put in any color.

##### Leaflet raster layer example

This snippet of code creates a custom layer with red parcel polygons and adds it to a leaflet map:

```
$.ajax({
  method: 'POST',
  url: 'https://tiles.makeloveland.com/api/v1/sources?token=...',
  contentType: 'application/json; charset=utf-8',
  dataType: 'json',
  data: JSON.stringify({
    "query": {
      "parcel": true,
    },
    "styles": "Map { background-color: rgba(0,0,0,0); } #loveland { polygon-fill: #FF0000; }",
  }),
}).done(function(data) {
  console.log('Got layer', data);
  L.tileLayer(data.tiles[0]).addTo(map);
});
```
