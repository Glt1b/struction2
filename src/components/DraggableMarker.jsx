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
    
    const [draggable, setDraggable] = useState(false)
    const { markers, setMarkers } = useContext(MarkersContext);
    const { projectMarkers, setProjectMarkers} = useContext(ProjectMarkersContext);
    const markerRef = useRef(null);

    // markers details states
    const [position, setPosition] = useState(props.position);
    const [number, setNumber] = useState(props.number);
    const [status, setStatus] = useState(props.status);
    const [materialsUsed, setMaterialUsed] = useState(props.materialsUsed);
    const [measurements, setMeasurements] = useState(props.measurements);
    const [service, setService] = useState(props.service);
    const [comment, setComment] = useState(props.comment);
    


    
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
  const updateMarker = () => {
    const id = `${props.user}-${Date.now()}`
        
        const obj = { [id]: { 
          "id": id,
          "number": number,
          "status": status,
          "location": props.currentLocation,
          "locationOnDrawing": position,
          "materialsUsed": materialsUsed,
          "measurements": measurements,
          "service": service,
          "completedBy": "",
          "comment": comment,
          "photos": [],
          "photos_after": []
      }}

      patchMarker(props.projectName, props.id, obj).then((response) => {
        setProjectMarkers(response.data.markers)
      })

  }

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={myMarker}>
      <Popup minWidth={90}>

        <span onClick={ () => toggleDraggable()}>
          {draggable
            ? 'Save position'
            : 'Change marker position'}
        </span><br/>



            <label>Number:</label><br/>
            <input
               className="input"
               value={number}
               type="text"
               onChange={((e) => {setNumber(e.target.value)})}
                ></input><br/>
            <label>Height:</label><br/>
            <input
               className="input"
               value={measurements[1]}
               type="text"
               onChange={((e) => {setComment([measurements[0], e.target.value])})}
                ></input><br/>
            <label>Width:</label><br/>
            <input
               className="input"
               value={measurements[0]}
               type="text"
               onChange={((e) => {setMeasurements([e.target.value, measurements[1]])})}
                ></input><br/>
            <label>Comment:</label><br/>
            <input
               className="input"
               value={comment}
               type="text"
               onChange={((e) => {setComment(e.target.value)})}
                ></input><br/>
            <button onClick={() => updateMarker()}>Update</button>
      
        <button onClick={ () => {delMarker()
                                 alert('marker has been deleted')}}>Delete marker</button>
      </Popup>
    </Marker>
  )
}
