import { React, useState, useContext, useEffect } from "react";
import { MapContainer, ImageOverlay } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js"
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import { postMarker } from "../utils/api.js";
import { useMapEvents } from 'react-leaflet/hooks'
import DraggableMarker from "./DraggableMarker";
import "leaflet/dist/leaflet.css";

const L = window["L"];

export default function Map(props) {

    const { markers, setMarkers } = useContext(MarkersContext);
    const { projectMarkers, setProjectMarkers } = useContext(ProjectMarkersContext);
    const bounds = [ [-3000, -3000], [3000, 3000] ];
    const [creationMode, setCreationMode] = useState(false);
    const [latlng, setLatlng] = useState(null)

    //update map after marker creation
    useEffect(() => {
      const m = projectMarkers.filter(item =>  item.location === props.currentLocation)
      setMarkers(m)
    }, [projectMarkers])
    
    
    // create marker function

    useEffect(() => {
      if(creationMode){
        createMarker();
        setCreationMode(false);
      }
    }, [latlng])

    const MarkerLocator = () => {
      
        const map = useMapEvents ({
          click (e) {
              setLatlng([e.latlng.lat, e.latlng.lng])
              }
      });
  
    }
    
    const createMarker = () => {

      if(creationMode){
        
        const id = `${props.user}-${Date.now()}`
        
        const obj = { [id]: { 
          "id": id,
          "number": "0",
          "status": "in progress",
          "location": props.currentLocation,
          "locationOnDrawing": [latlng[0], latlng[1]],
          "materialsUsed": [],
          "measurements": [0, 0],
          "service": [],
          "completedBy": "",
          "photos": [],
          "photos_after": []

      }}

      postMarker(props.projectName, obj).then((response) => {
        setProjectMarkers(response.data.markers)
        setCreationMode(false)
      })
      
    } else {}
    }



    return (
        <div className="App">
          
          <MapContainer
            className="map"
            crs={L.CRS.Simple}
            bounds={bounds}
            zoom={0}
            minZoom={-3}
            maxZoom={1}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <ImageOverlay url={`data:image/jpeg;base64,${props.image}`} bounds={bounds}>
              
              { markers.map((item) => {
                return (
                  <DraggableMarker key={item.id}
                                   id={item.id}
                                   position={item.locationOnDrawing}
                                   number={item.number}
                                   status={item.status}
                                   location={item.location}
                                   locationOnDrawing={item.locationOnDrawing}
                                   materialUsed={item.materialUsed}
                                   measurements={item.measurements}
                                   service={item.service}
                                   completedBy={item.completedBy}
                                   photos={item.photos}
                                   photos_after={item.photos_after}
                                   projectName={props.projectName}
                                   
                                    />
                )})
              }
              
    
          </ImageOverlay>
          <MarkerLocator />
          <button className="create-btn" onClick={ () => setCreationMode(true)}>Create new marker</button>
          </MapContainer>

        </div>
      );


}

