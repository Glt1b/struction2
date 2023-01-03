import { createContext, useState } from "react";

export const ProjectMarkersContext = createContext();

export const ProjectMarkersProvider = ({ children }) => {
  const [projectMarkers, setProjectMarkers] = useState([]);


  return (
    <ProjectMarkersContext.Provider value={{ projectMarkers, setProjectMarkers}}>
      {children}
    </ProjectMarkersContext.Provider>
  );
};