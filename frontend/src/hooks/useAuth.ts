"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import api from "../../src/lib/axios";

export function useAuth(){
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const register = async (data:{
        name:string;
        email:string;
        password:string;
        phone:string;
    })=>{
        setError("");
        setLoading(true);
        try{
            await api.post("/auth/register", data);
            router.push("/dashboard");
        }catch(error:any){
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        }finally{
            setLoading(false);
        }
    };

    const login = async (data:{
        email:string;
        password:string;
    })=>{
        setError("");
        setLoading(true);
        try{
            await api.post("/auth/login", data);
            router.push("/dashboard");
        }catch(error:any){
            setError(error.response?.data?.message || "Login failed. Please try again.");
        }finally{
            setLoading(false);
        }
    };

    return{register, login, error, loading};
}
