import "leaflet/dist/leaflet.css";
import "./App.css";
import { React, useEffect, useState, useContext } from "react";
import { getProjectDetails, getImage } from "./utils/api";
import { MarkersContext } from "./contexts/Markers.js";
import { ProjectMarkersContext } from "./contexts/ProjectMarkers";
import Map from "./components/Map.jsx";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import structionLogo from "./images/structionLogo.svg";
import structionHeaderLogo from "./images/struction-logo-header.svg";

export default function App() {
  // worker state hardcoded and to be changed later
  const [user, setUser] = useState({
    key: "offline_user",
    props: {
      mail: "mail@gmail.com",
      role: "worker",
      password: "worker123",
      projects: ["apartments_unit_", "medical_centre_"],
    },
  });

  // contract states
  const [projectName, setProjectName] = useState(false);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const [currentLocation, setCurrentLocation] = useState("");
  const [currDrawing, setCurrDrawing] = useState("");
  const { markers, setMarkers } = useContext(MarkersContext);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const [markersFilter, setMarkersFilter] = useState(false);

  // proSidebar
  const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } =
    useProSidebar();

  // request for contract details and assign them to states
  useEffect(() => {
    if (projectName) {
      getProjectDetails(projectName).then((result) => {
        setProjectMarkers(result.project[1]);
        setLocations(result.project[0].props.locations);
        setServices(result.project[0].props.services);
        setMaterials(result.project[0].props.materials);
        setIsProjectLoaded(true);
      });
    }
  }, [projectName]);

  // request drawing images and store them in state when project details are loaded
  useEffect(() => {
    if (isProjectLoaded) {
      const arr = [];
      for (let location of locations) {
        getImage(location.url).then((result) => {
          const obj = {};
          obj["name"] = location.name;
          obj["url"] = result;
          arr.push(obj);
          if (arr.length === locations.length) {
            setLocations(arr);
          }
        });
      }
    }
  }, [isProjectLoaded]);

  //extract current drawing
  useEffect(() => {
    if (currentLocation !== "") {
      setMarkersFilter(false);
      const l = locations.filter((item) => item.name === currentLocation);
      const d = l[0].url;
      setCurrDrawing(d);
      setMarkersFilter(true);
    }
  }, [currentLocation]);

  // extract current markers
  useEffect(() => {
    if (currentLocation !== "") {
      const m = projectMarkers.filter(
        (item) => item.location === currentLocation
      );
      setMarkers(m);
    }
  }, [currentLocation]);

  return (
    <div className="App">
      <header className="App-header">
        {isProjectLoaded ? (
          <p>
            Welcome {user.key}, you are on{" "}
            <strong>
              {projectName}/{currentLocation}
            </strong>
          </p>
        ) : (
          <p>Welcome {user.key}, choose your project</p>
        )}
        <img
          className="struction-logo--header"
          src={structionHeaderLogo}
          alt="struction logo"
        />
      </header>
      <Sidebar>
        <Menu>
          <SubMenu label="Menu">
            <SubMenu label="Projects">
              {user.props.projects.map((project) => {
                return (
                  <MenuItem
                    onClick={() => {
                      setIsProjectLoaded(false);
                      setProjectName(project);
                      setCurrentLocation("");
                    }}
                    key={project}
                  >
                    {project}
                  </MenuItem>
                );
              })}
            </SubMenu>

            {projectName ? (
              <SubMenu label="Locations">
                {locations.map((location) => {
                  return (
                    <MenuItem
                      value={location.name}
                      key={location.name}
                      onClick={() => {
                        setCurrentLocation(location.name);
                      }}
                    >
                      {location.name}
                    </MenuItem>
                  );
                })}
              </SubMenu>
            ) : null}

            <MenuItem> Manager Dashboard </MenuItem>
            <MenuItem> Offilne mode </MenuItem>
            <MenuItem> Logout </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>
      {!isProjectLoaded ? (
        <img
          className="struction-logo"
          src={structionLogo}
          alt="struction logo"
        />
      ) : null}

      {currentLocation !== "" && markersFilter ? (
        <Map
          currentLocation={currentLocation}
          user={user.key}
          projectName={projectName}
          materials={materials}
          services={services}
          image={currDrawing}
        />
      ) : null}
    </div>
  );
}
