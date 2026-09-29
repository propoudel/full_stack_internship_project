import axios from "axios";


const api = axios.create({
    baseURL : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    headers:{
        "Content-Type":"application/json",
    },
    withCredentials:true,// sends and receives cookies automatically
});

// for automatically refresh the access token if a request fails with 401

api.interceptors.response.use(
    (response)=> response,
    async(error)=>{
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

        try{
            await api.post("/auth/refresh");
            return api(originalRequest);
        }catch(refreshError){
            window.location.href ="/login";
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
    }
);

export default api;