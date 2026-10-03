"use client";

import {  useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function MyCompanyPage(){
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound,setNotFound] = useState(false);


    useEffect(()=>{
        const fetchCompany = async()=>{
            try{
                const res = await api.get("/companies/me/company");
                setCompany(res.data.data);
            }catch(err:any){
                if(err.response?.status === 404){
                    setNotFound(true);
                }else{
                    router.push("/login");
                }
            }finally{
                setLoading(false);
            }
        };
        fetchCompany();
    },[router]);
    if(loading) return null;

    if(notFound){
        return ( <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 text-center shadow-md">
          <h1 className="text-xl font-bold text-gray-800">You haven't created a company yet</h1>
          <Link
            href="/company/create"
            className="inline-block rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
          >
            Create Your Company
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={company.logo}
            alt={company.name}
            className="h-16 w-16 rounded object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
            <p className="text-gray-500">{company.industry} · {company.companySize}</p>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{company.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <p><strong>Email:</strong> {company.email}</p>
          <p><strong>Phone:</strong> {company.phone}</p>
          <p><strong>Website:</strong> {company.website}</p>
          <p><strong>Address:</strong> {company.address}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/company/edit"
            className="rounded bg-sky-500 px-4 py-2 text-white hover:bg-sky-600"
          >
            Edit Company
          </Link>
          <Link
            href="/jobs/me"
            className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
          >
            Manage Jobs
          </Link>
          <Link
            href="/jobs/create"
            className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </main>
    );
    }
