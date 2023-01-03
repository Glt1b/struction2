import "./App.css";
import { React, useEffect, useState } from "react";
import "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import marker from "./images/map-marker-svgrepo-com.svg";
import map from "./images/drawing.jpg"
import axios from "axios";
import {Buffer} from 'buffer';


const L = window["L"];
const myMarker = new Icon({ iconUrl: marker, iconSize: [32, 32] });

export default function App() {

  const api = axios.create({
    baseURL: "https://struction-backend.cyclic.app/api",
  });

  const [plan, setPlan] = useState('')

  const bounds = [
    [-3000, -3000],
    [3000, 3000]
  ];

  useEffect(() => {
    api.get("/image/drawing").then((res) => {

      const data = res.data.image.data;
      let TYPED_ARRAY = new Uint8Array(data);

      const STRING_CHAR = TYPED_ARRAY.reduce((data, byte)=> {
        return data + String.fromCharCode(byte);
        }, '');

      setPlan(STRING_CHAR)
      })
  }, [])

  return (
    <div className="App">
      <MapContainer
        className="map"
        crs={L.CRS.Simple}
        bounds={bounds}
        zoom={0}
        minZoom={-3}
        maxZoom={1}
      >
        <ImageOverlay url={plan === '' ? map : plan} bounds={bounds}>
          
          <Marker position={[-300, 1]} icon={myMarker}>
          <Popup>
            <p>details</p>
          </Popup>
          </Marker>

        </ImageOverlay>
      </MapContainer>
    </div>
  );
}
