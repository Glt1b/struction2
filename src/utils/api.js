import axios from "axios";

const beStructionApi = axios.create({
  baseURL: "https://struction-backend.cyclic.app/api",
});

export const getUser = (user) => {
  return beStructionApi.get("/users/" + user).then((res) => {
    return res.data.user;
  });
};
export const getProjectDetails = (projectName) => {
  return beStructionApi.get("/projects/" + projectName).then((res) => {
    return res.data.result;
  });
};

export const postMarker = (projectName, markerBody) => {
  ///api/markers/:project_name'
  
  return beStructionApi.post("/markers/" + projectName, markerBody).then((response) => {
    return response
  });
};

export const deleteMarker = (projectName, markerId) => {
  //: '/api/:project_name/:marker_id'
  return beStructionApi.delete(`/${projectName}/${markerId}`).then((result) => {
    return result
  })
};

export const patchMarker = (projectName, markerId, obj) => {
  const patchBody = obj;
  return beStructionApi.patch(`/${projectName}/${markerId}`, patchBody).then((result) => {
    return result
  });
};


export const getImage = (image_id) => {
    return beStructionApi.get(`/image/${image_id}`).then((result) => {
      
      const data = result.data.image.data;
      let TYPED_ARRAY = new Uint8Array(data);

      const STRING_CHAR = TYPED_ARRAY.reduce((data, byte)=> {
        return data + String.fromCharCode(byte);
        }, '');

      let base64String = window.btoa(STRING_CHAR);

      return(base64String)
    })
    
}
