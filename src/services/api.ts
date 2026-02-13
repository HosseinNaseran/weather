import axios from "axios";


const client = axios.create({
    baseURL : "https://api.openweathermap.org/data/2.5"
})

const APIKey = "c6f036809400e39a383c8654b49b6448"

 export async function getCurrentWeather({lat , lon } : {lat : string , lon : string}) {
     
   const {data} = await client(`/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`)
    return data


    
 }