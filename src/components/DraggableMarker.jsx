import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import "leaflet/dist/leaflet.css";
import marker from "../images/map-marker.svg";
import "leaflet/dist/leaflet.css";
import { deleteMarker, patchMarker } from "../utils/api";

const myMarker = new Icon({ iconUrl: marker, iconSize: [32, 32] });

export default function DraggableMarker(props) {
  const [draggable, setDraggable] = useState(false);
  const { markers, setMarkers } = useContext(MarkersContext);
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const markerRef = useRef(null);

  // markers details states
  const [position, setPosition] = useState(props.position);
  const [number, setNumber] = useState(props.number);
  const [status, setStatus] = useState(props.status);
  const [materialsUsed, setMaterialUsed] = useState(props.materialsUsed);
  const [measurements, setMeasurements] = useState(props.measurements);
  const [serviceUsed, setServiceUsed] = useState(props.service);
  const [comment, setComment] = useState(props.comment);

  const availableStatus = ["completed", "inProgress", "issue"];

  // drag marker handlers
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  const toggleDraggable = () => {
    if (draggable) {
      setDraggable(false);
    } else {
      setDraggable(true);
    }
  };

  // delete Marker
  const delMarker = () => {
    deleteMarker(props.projectName, props.id).then((result) => {
      const m = markers.filter((item) => item.id !== props.id);
      setMarkers(m);
      const pm = projectMarkers.filter((item) => item.id !== props.id);
      setProjectMarkers(pm);
    });
  };

  // save markers details
  const updateMarker = () => {
    const id = `${props.user}-${Date.now()}`;

    const obj = {
      [id]: {
        id: id,
        number: number,
        status: status,
        location: props.currentLocation,
        locationOnDrawing: position,
        materialsUsed: materialsUsed,
        measurements: measurements,
        service: serviceUsed,
        completedBy: "",
        comment: comment,
        photos: [],
        photos_after: [],
      },
    };

    patchMarker(props.projectName, props.id, obj).then((response) => {
      setProjectMarkers(response.data.markers);
    });
  };

  // form handlers

  const handleMaterials = (item) => {
    let updatedList = [...materialsUsed];
    if (!materialsUsed.includes(item)) {
      updatedList = [...materialsUsed, item];
    } else {
      updatedList.splice(materialsUsed.indexOf(item), 1);
    }
    setMaterialUsed(updatedList);
  };

  const handleService = (item) => {
    console.log("clicked");

    let updatedList = [...serviceUsed];
    if (!serviceUsed.includes(item)) {
      updatedList = [...serviceUsed, item];
    } else {
      updatedList.splice(serviceUsed.indexOf(item), 1);
    }
    setServiceUsed(updatedList);
  };

  const handleStatus = (item) => {
    setStatus(item);
  };

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={myMarker}
    >
      <Popup minWidth={320}>
        <div className="marker-form">
          <span onClick={() => toggleDraggable()}>
            {draggable ? "Save position" : "Change marker position"}
          </span>

          <div className="checkList">
            <div className="title" id="status">
              <b>Status</b>
            </div>
            <div className="list-container" id="status-container">
              {availableStatus.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={status.includes(item) ? true : false}
                    onChange={() => handleStatus(item)}
                  />
                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-input">
            <div className="title">
              <b>Number</b>
            </div>

            <input
              className="input"
              value={number}
              type="text"
              onChange={(e) => {
                setNumber(e.target.value);
              }}
            ></input>
          </div>

          <div className="checkList">
            <div className="title" id="title-checkbox">
              <b>Materials</b>
            </div>
            <div className="list-container">
              {props.materials.map((item, index) => (
                <div key={index} className="checkbox">
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={materialsUsed.includes(item) ? true : false}
                    onChange={() => handleMaterials(item)}
                  />
                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="checkList">
            <div className="title" id="title-checkbox">
              <b>Services</b>
            </div>
            <div className="list-container" id="services-container">
              {props.services.map((item, index) => (
                <div key={index} className="checkbox">
                  <input
                    value={item}
                    type="checkbox"
                    checked={serviceUsed.includes(item) ? true : false}
                    onChange={() => handleService(item)}
                  />
                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-input">
            <div className="title">
              <label htmlFor="height">
                <b>Height</b>
              </label>
            </div>

            <input
              id="height"
              className="input"
              value={measurements[1]}
              type="text"
              onChange={(e) => {
                setComment([measurements[0], e.target.value]);
              }}
            ></input>
            <div className="title">
              <label htmlFor="width">
                <b>Width</b>
              </label>
            </div>
            <input
              id="width"
              className="input"
              value={measurements[0]}
              type="text"
              onChange={(e) => {
                setMeasurements([e.target.value, measurements[1]]);
              }}
            ></input>
          </div>

          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Comment</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={comment}
              type="text"
              onChange={(e) => {
                setComment(e.target.value);
              }}
            ></input>
          </div>

          <button onClick={() => updateMarker()}>Update</button>

          <button
            id="delete-btn"
            onClick={() => {
              delMarker();
              alert("marker has been deleted");
            }}
          >
            Delete marker
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
