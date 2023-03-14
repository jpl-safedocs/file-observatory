/**
 * Copyright (c) 2018-2023 California Institute of Technology ("Caltech"). U.S.
 * Government sponsorship acknowledged.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Caltech nor its operating division, the Jet Propulsion
 *   Laboratory, nor the names of its contributors may be used to endorse or
 *   promote products derived from this software without specific prior written
 *   permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { FC, useMemo, useState, useCallback } from "react";
import { useInterval } from "usehooks-ts";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { StaticMap } from "react-map-gl";

import useStore from "../../utils/store";

import "../../scss/GeoSpatial.scss";

const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 1,
  pitch: 0,
  bearing: 0,
};

const normalizeCoordinate = (coord: number, limit: number) => {
  let limitedCoord = Math.min(Math.max(Math.round(coord * 100) / 100, -limit), limit);
  return limitedCoord;
};

const getViewportBounds = (map: any): any[] => {
  if (!map || !map.state || !map.state.viewportCorners) {
    return [[-180, 90], [180, -90], 1];
  }

  let topLeft = [
    normalizeCoordinate(map.state.viewportCorners[0][0], 180),
    normalizeCoordinate(map.state.viewportCorners[0][1], 90),
  ];
  let bottomRight = [
    normalizeCoordinate(map.state.viewportCorners[2][0], 180),
    normalizeCoordinate(map.state.viewportCorners[2][1], 90),
  ];
  let zoom = Math.ceil(map.state.zoom) || 1;

  return [topLeft, bottomRight, zoom];
};

interface GeoSpatialProps {
  isMapVisible?: boolean;
}

const GeoSpatial: FC<GeoSpatialProps> = ({ isMapVisible = true }) => {
  const allMappingFields = useStore((state) => state.allMappingFields);
  const [geoSpatialField, setGeoSpatialField] = useStore((state) => [state.geoSpatialField, state.setGeoSpatialField]);
  const documents = useStore((state) => state.documents);
  const selectedDocuments = useStore(
    useCallback(
      (state) =>
        state.selectedDocuments.map((doc) => ({
          _source: state.documents[doc] ? state.documents[doc]._source : null,
          _id: state.documents[doc] ? state.documents[doc]._id : null,
        })),
      []
    )
  );
  const totalDocumentCount = useStore((state) => state.totalDocumentCount);
  const [geoLocations, fetchGeoLocations] = useStore((state) => [state.geoLocations, state.fetchGeoLocations]);
  const [geoSize, setGeoSize] = useState<number>(0);

  const data = useMemo(() => {
    let mappedCoords: any[] = [];

    if (geoSize >= 0) {
      mappedCoords = documents
        .filter(
          (document) =>
            document &&
            document._source &&
            document._source[geoSpatialField] &&
            typeof document._source[geoSpatialField] === "string" &&
            document._source[geoSpatialField].split(",").length === 2
        )
        .map((document) => {
          let coords = document._source[geoSpatialField];
          if (coords) {
            coords = coords
              .split(",")
              .map((coord: string) => parseFloat(coord.trim()))
              .reverse();
          } else {
            coords = [0, 0];
          }
          return {
            coordinates: coords,
            weight: 1,
          };
        });
    } else {
      mappedCoords = geoLocations.map((location) => {
        return {
          coordinates: [location.coordinates.location.lon, location.coordinates.location.lat],
          weight: location.doc_count,
        };
      });
    }
    return mappedCoords;
  }, [documents, geoSpatialField, geoLocations, geoSize]);

  const selectedCoords = useMemo(() => {
    return selectedDocuments
      .filter(
        (document) =>
          document &&
          document._source &&
          document._source[geoSpatialField] &&
          typeof document._source[geoSpatialField] === "string" &&
          document._source[geoSpatialField].split(",").length === 2
      )
      .map((document) => {
        let coords = document._source[geoSpatialField];
        if (coords) {
          coords = coords
            .split(",")
            .map((coord: string) => parseFloat(coord.trim()))
            .reverse();
        } else {
          coords = [0, 0];
        }
        return {
          coordinates: coords,
          weight: 1,
          message: `${document._id}: ${coords}`,
        };
      });
  }, [selectedDocuments, geoSpatialField]);

  const [topLeftGeoBound, setTopLeftGeoBound] = useState<number[]>([-180, 90]);
  const [bottomRightGeoBound, setBottomRightGeoBound] = useState<number[]>([180, -90]);
  const [zoomLevel, setZoomLevel] = useState<number>(2);

  const [pointTooltip, setPointTooltip] = useState<any>({});
  const pointLayer = new ScatterplotLayer({
    id: "selected-docs",
    data: selectedCoords,
    stroked: true,
    filled: true,
    getPosition: (point: any) => point.coordinates,
    getRadius: (point: any) => point.weight,
    radiusUnits: "pixels",
    radiusMinPixels: 5,
    getFillColor: [0, 175, 255],
    pickable: true,
    onHover: (info: any) => setPointTooltip(info),
  });

  const heatmap = new HeatmapLayer({
    id: "heatmapLayer",
    data,
    getPosition: (point: any) => point.coordinates,
    getWeight: (point: any) => point.weight,
    aggregation: "SUM",
  });

  useInterval(
    () => {
      if (geoSize !== -1) {
        let [topLeft, bottomRight, zoom] = getViewportBounds(heatmap);
        setTopLeftGeoBound(topLeft);
        setBottomRightGeoBound(bottomRight);
        setZoomLevel(zoom);
      }
    },
    geoSize === -1 ? null : 1000
  );

  return (
    <div style={{ paddingTop: "10px" }}>
      <div style={{ display: "flex" }}>
        <FormControl style={{ minWidth: "175px" }}>
          <InputLabel id="geo-field-label-id">Geospatial Field</InputLabel>
          <Select
            id="geo-field-select"
            value={geoSpatialField && allMappingFields.includes(geoSpatialField) ? geoSpatialField : ""}
            label="Geospatial Field"
            labelId="geo-field-label-id"
            onChange={(evt) => {
              setGeoSpatialField(evt.target.value);
            }}
            style={{ margin: "5px" }}
          >
            {allMappingFields.map((field) => (
              <MenuItem key={`geo-field-${field}`} value={field}>
                {field}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="geo-count-label-id">Number of Points</InputLabel>
          <Select
            id="geo-count-select"
            value={!geoSize || geoSize === 0 ? documents.length : geoSize}
            label="Number of Points"
            labelId="geo-count-label-id"
            onChange={(evt) => {
              let size = typeof evt.target.value === "string" ? parseFloat(evt.target.value) : evt.target.value;
              setGeoSize(size);
              if (size === -1) fetchGeoLocations(topLeftGeoBound, bottomRightGeoBound, zoomLevel);
            }}
            style={{ margin: "5px", minWidth: "120px" }}
          >
            {[documents.length, 1000, 5000, 10000].map((count: number) => (
              <MenuItem key={`geo-count-${count}`} value={count} disabled={count > totalDocumentCount}>
                {count}
              </MenuItem>
            ))}
            <MenuItem value={-1}>All</MenuItem>
          </Select>
        </FormControl>
        <FormControl style={{ marginLeft: "auto" }}>
          <InputLabel id="precision-label-id">Zoom Precision</InputLabel>
          <Select
            id="precision-select"
            value={zoomLevel}
            label="Zoom Precision"
            labelId="precision-label-id"
            disabled={geoSize !== -1}
            onChange={(evt) => {
              let precision = typeof evt.target.value === "string" ? parseFloat(evt.target.value) : evt.target.value;
              setZoomLevel(precision);
              fetchGeoLocations(topLeftGeoBound, bottomRightGeoBound, precision);
            }}
            style={{ margin: "5px", minWidth: "120px" }}
          >
            {Array.from(new Set([zoomLevel, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
              .sort((a, b) => a - b)
              .map((level: number) => (
                <MenuItem key={`precision-${level}`} value={level}>
                  {level}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>
      <div style={{ width: "100%", height: "500px" }}>
        {isMapVisible && (
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            layers={[heatmap, pointLayer]}
            style={{ position: "relative" }}
            onViewStateChange={({ viewState }: { viewState: any }) => {
              if (heatmap.state && heatmap.state.viewportCorners) {
                let [topLeft, bottomRight, zoom] = getViewportBounds(heatmap);
                let latSensitivity = 30;
                let lonSensitivity = 60;
                let zoomSensitivity = 2;

                if (
                  geoSize === -1 &&
                  (Math.abs(zoom - zoomLevel) > zoomSensitivity ||
                    Math.abs(topLeft[0] - topLeftGeoBound[0]) > lonSensitivity ||
                    Math.abs(topLeft[1] - topLeftGeoBound[1]) > latSensitivity ||
                    Math.abs(bottomRight[0] - bottomRightGeoBound[0]) > lonSensitivity ||
                    Math.abs(bottomRight[1] - bottomRightGeoBound[1]) > latSensitivity)
                ) {
                  fetchGeoLocations(topLeft, bottomRight, Math.ceil(zoom));
                  setTopLeftGeoBound(topLeft);
                  setBottomRightGeoBound(bottomRight);
                  setZoomLevel(zoom);
                }
              }
              return viewState;
            }}
          >
            <MapView id="map" width="100%" controller={true}>
              <StaticMap
                mapStyle={{
                  version: 8,
                  sources: {
                    "raster-tiles": {
                      type: "raster",
                      tiles: [
                        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      ],
                      tileSize: 256,
                      attribution:
                        'Map tiles and data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
                    },
                  },
                  layers: [
                    {
                      id: "simple-tiles",
                      type: "raster",
                      source: "raster-tiles",
                      minzoom: 0,
                      maxzoom: 22,
                    },
                  ],
                }}
                attributionControl={true}
              />
              {pointTooltip.object && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 9999,
                    pointerEvents: "none",
                    left: pointTooltip.x,
                    top: pointTooltip.y,
                    background: "white",
                    padding: "5px",
                  }}
                >
                  {pointTooltip.object.message}
                </div>
              )}
            </MapView>
          </DeckGL>
        )}
      </div>
    </div>
  );
};

export default GeoSpatial;
