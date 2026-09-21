"use client";

import { useState} from "react";

export function useForm<T extends Record<string, string>>(initialValues:T){
    const [values, setValues] = useState<T>(initialValues);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const reset =()=> setValues(initialValues);
    return{values, handleChange, reset};
}