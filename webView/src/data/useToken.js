import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import data from './token'
function useToken(){
   const [token,setToken] = useState()
   const navigate = useNavigate();
   useEffect(() => {
    data.token=token;
    console.log(token,'sss')
     if (!token) {
       navigate("/login");
     }
   }, [token]);
   return {
    token,
    setToken
   }
}
export default useToken;
