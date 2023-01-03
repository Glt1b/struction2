import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js"
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js"
import "leaflet/dist/leaflet.css";
import marker from "../images/map-marker.svg";
import "leaflet/dist/leaflet.css";
import { deleteMarker, patchMarker } from "../utils/api";


const myMarker = new Icon({ iconUrl: marker, iconSize: [32, 32] });

export default function DraggableMarker(props) {
    
    const [position, setPosition] = useState(props.position)
    const [draggable, setDraggable] = useState(false)
    const { markers, setMarkers } = useContext(MarkersContext);
    const { projectMarkers, setProjectMarkers} = useContext(ProjectMarkersContext);
    const markerRef = useRef(null)

    
    
    // drag marker handlers
    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
    }),
    [],
  )

  const toggleDraggable = () => {
    if(draggable){
        setDraggable(false)
    } else {
        setDraggable(true)
    }
  }

  // delete Marker
  const delMarker = () => {
    deleteMarker(props.projectName, props.id).then((result) => {
      const m = markers.filter((item) => item.id !== props.id )
      setMarkers(m)
      const pm = projectMarkers.filter((item) => item.id !== props.id )
      setProjectMarkers(pm)
    })
  }

  // save markers details
  const saveMarkerDetails = () => {
    const obj = {}
    // store details in states
    // make a new object
    // patch object in DB ->
    // setMarkers locally
  }

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={myMarker}>
      <Popup minWidth={90}>
        <span onClick={ () => {toggleDraggable();
                               saveMarkerDetails()}}>
          {draggable
            ? 'Save position'
            : 'Change marker position'}
        </span>
        <p>{props.location}</p>
        <button onClick={ () => delMarker()}>Delete marker</button>
      </Popup>
    </Marker>
  )
}
