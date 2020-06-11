---
weight: 1
category: Developer Notes
published: true
intro: How developers can use the Loveland tileserver
title: Using the Tileserver
---

The Loveland tile service provides parcel tiles in raster and vector formats for use with web mapping tools like [Mapbox GL](https://www.mapbox.com/help/define-mapbox-gl/) and [Leaflet](https://leafletjs.com/). This service is available to clients with a [nationwide data license](https://makeloveland.com/parcels).

This tool is still in beta. Please direct feedback, bugs and questions to [team@makeloveland.com](mailto:team@makeloveland.com).

## API

All requests will be to the `https://tiles.makeloveland.com` domain, with the paths described below per-request.

### Authentication and tokens

All requests to the API must include a `token` parameter. Please contact us via [team@makeloveland.com](mailto:team@makeloveland.com) to get your API token during the beta.

### Standard parcel tiles

A nationwide layer of parcel outlines provided in vector ([MVT](https://www.mapbox.com/vector-tiles/specification/)) and raster (PNG) formats.

#### TileJSON

We serve [TileJSON](https://www.mapbox.com/help/define-tilejson/)-formatted metadata for generic parcel tiles:

* Raster tiles: `/api/v1/parcels`
* Vector tiles: `/api/v1/parcels?format=mvt`

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

### Custom layers

Use a Layer to get tiles with custom styles (raster tiles only).

A Layer defines a set of data and styles. Each layer has a unique ID. Each unqiue set of styles defines new layer -- you cannot edit existing layers.

### Building layers

To create a layer, POST a layer definition to `/api/v1/sources?token=`.

#### Vector tiles

Pass the `?format='mvt'` parameter to a layer request to get vector-first TileJSON.
Otherwise, vector tile urls will be included in the tilejson under the non-standard `vector`
key.

#### Layer definitions

A layer definition has:

- `query`: Set to `parcels: true` to select parcel data
- `fields`: An optional list of [standard schema columns](/articles/schema) to include. By default, tiles include `address`, `owner`, and `path`
- `styles`: Optional, A string of [CartoCSS styles](https://carto.com/developers/styling/cartocss/) (see "composing styles" below). We apply a set of default Loveland styles if you don't specify any.

#### Sample layer request

This layer requests parcels with a custom line color and additional fields:

```
POST /api/v1/sources?token=
{
  query: {
    parcels: true
  },
  fields: {
    parcel: ['usecode', 'usedesc', 'parval', 'landval']
  }
  styles: 'Map{} #loveland { line-color: #69387a; }'
}
```

#### Sample layer response

You'll get a tilejson response that includes:

- a unique layer ID
- the tile URL template for use in slippy maps
- the query and styles you submitted

**Warning**: Do not cache or otherwise store the layer ID or tile path between
sessions. The layer ID and paths you receive may change at any time.
Always recreate the layer by POSTing your layer definition.

```
{
  "tilejson":"2.1.0",
  "id":"e1cd578db8e35949c5c25a479124035a2fa14fbe",
  "maxZoom":21,
  "tiles":["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e1cd578db8e35949c5c25a479124035a2fa14fbe/{z}/{x}/{y}.png?token="],
  "grids":["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e1cd578db8e35949c5c25a479124035a2fa14fbe/{z}/{x}/{y}.json?token="],
  "vector":["https://tiles.makeloveland.com/api/v1/sources/parcel/layers/e1cd578db8e35949c5c25a479124035a2fa14fbe/{z}/{x}/{y}.mvt?token="],
  "query": {
    "parcel": true
  },
  "fields":{},
  "styles":"Map { background-color: rgba(0,0,0,0); } #loveland { line-color: #69387a; }"
}
```

#### Composing styles

You can style raster tiles by composing [CartoCSS styles](https://carto.com/developers/styling/cartocss/). Styles should be applied to the `#loveland` layer.

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

#### Leaflet raster layer example

To add a custom styled layer to Leaflet:

```
$.ajax({
  method: 'POST',
  url: 'https://makeloveland.com/api/v1/sources?token=...',
  contentType: 'application/json; charset=utf-8',
  dataType: 'json',
  data: JSON.stringify({
    query: {
      parcel: true,
    },
    styles: 'Map { background-color: rgba(0,0,0,0); } #loveland { polygon-fill: #000; }',
  }),
}).done(function(data) {
  console.log('Got layer', data);
  L.tileLayer(data.tiles[0]).addTo(map);
});
```


