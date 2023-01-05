import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import "leaflet/dist/leaflet.css";
import { deleteMarker, getImage, patchMarker } from "../utils/api";
import ImageUploading from "react-images-uploading";
import NewWindow from "react-new-window";
import marker from "../images/map-marker.svg";
import marker1 from "../images/map-marker-issue.svg";
import marker2 from "../images/map-marker-completed.svg";

const myMarker = new Icon({ iconUrl: marker, iconSize: [32, 32] });
const myIssueMarker = new Icon({ iconUrl: marker1, iconSize: [32, 32] });
const myCompletedMarker = new Icon({ iconUrl: marker2, iconSize: [32, 32] });

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

  // photo states
  const [photosOpen, setPhotosOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [photos, setPhotos] = useState(props.photos);
  const [zoom, setZoom] = useState("");

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  useEffect(() => {
    if (photosOpen) {
      for (let photo of photos) {
        getImage(photo).then((result) => {
          if (result) {
            const obj = { data_url: "data:image/jpeg;base64," + result };
            setImages([...images, obj]);
          }
        });
      }
    }
  }, [photosOpen]);

  /* When DynamoDB is working correctly we need to add:
      - upload photo to storage
      - delete photo from storage */

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
    const id = props.id;

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
      icon={
        status === "completed"
          ? myCompletedMarker
          : status === "issue"
          ? myIssueMarker
          : myMarker
      }
    >
      <Popup minWidth={90}>
        <div className="marker-form">
          <span onClick={() => toggleDraggable()}>
            {draggable ? "Save position" : "Change marker position"}
          </span>
          <br />

          <div className="checkList">
            <div className="title">
              <b>Status:</b>
            </div>
            <div className="list-container">
              {availableStatus.map((item, index) => (
                <div key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={status.includes(item) ? true : false}
                    onChange={() => handleStatus(item)}
                  />
                  <label for={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

          <label>
            <b>Number:</b>
          </label>

          <input
            className="input"
            value={number}
            type="text"
            onChange={(e) => {
              setNumber(e.target.value);
            }}
          ></input>

          <div className="checkList">
            <div className="title">
              <b>Material used:</b>
            </div>
            <div className="list-container">
              {props.materials.map((item, index) => (
                <div key={index}>
                  <input
                    value={item}
                    type="checkbox"
                    checked={materialsUsed.includes(item) ? true : false}
                    onChange={() => handleMaterials(item)}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="checkList">
            <div className="title">
              <b>Services:</b>
            </div>
            <div className="list-container">
              {props.services.map((item, index) => (
                <div key={index}>
                  <input
                    value={item}
                    type="checkbox"
                    checked={serviceUsed.includes(item) ? true : false}
                    onChange={() => handleService(item)}
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <label>
            <b>Height:</b>
          </label>

          <label>
            <b>Height:</b>
          </label>
          <br />
          <input
            className="input"
            value={measurements[1]}
            type="text"
            onChange={(e) => {
              setMeasurements([measurements[0], e.target.value]);
            }}
          ></input>
          <br />
          <label>
            <b>Width:</b>
          </label>
          <br />

          <input
            className="input"
            value={measurements[0]}
            type="text"
            onChange={(e) => {
              setMeasurements([e.target.value, measurements[1]]);
            }}
          ></input>

          <label>
            <b>Comment:</b>
          </label>

          <label>
            <b>Comment:</b>
          </label>
          <br />
          <input
            className="input"
            value={comment}
            type="text"
            onChange={(e) => {
              setComment(e.target.value);
            }}
          ></input>
          <br />
          <button onClick={() => updateMarker()}>Update</button>

          <button
            onClick={() => {
              delMarker();
              alert("marker has been deleted");
            }}
          >
            Delete marker
          </button>
          {/* PHOTO GALLERY COMPONENTS */}

          {!photosOpen ? (
            <button onClick={() => setPhotosOpen(true)}>Load gallery</button>
          ) : (
            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                // UI
                <div className="upload__image-wrapper">
                  <button
                    style={isDragging ? { color: "red" } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    Upload photo
                  </button>
                  &nbsp;
                  {imageList.map((image, index) => (
                    <div key={index}>
                      <span
                        onClick={() => {
                          setZoom(image["data_url"]);
                          return (
                            <NewWindow>
                              <img src={zoom} alt="" />
                            </NewWindow>
                          );
                        }}
                      >
                        <img src={image["data_url"]} alt="" />
                        {zoom !== "" ? (
                          <NewWindow>
                            <img src={zoom} alt="" />
                          </NewWindow>
                        ) : null}
                      </span>
                      <div className="image-item__btn-wrapper">
                        <button onClick={() => onImageRemove(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
