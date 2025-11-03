// @ts-types="npm:@types/express@5.0.3"

import express from "express";

const app = express();

app.get("/", async (req, res) => { 
  const stationCode = req.headers["station-code"];
  const headers = {
    "Authorization": `Basic ${Deno.env.get("AUTH")}`
  }
  const apiRes = await fetch(`https://api.rtt.io/api/v1/json/search/${stationCode}`, {headers: headers})
  const json = await apiRes.json() as any
  
  const response: any = {
    location: json.location.name || "Unknown Location",
    services: []
  }
  
  if (json.services) {
    response["services"] = 
    json.services
      .filter((service: any) => service.locationDetail.realtimeDeparture != null)
      .map((service: any) => { return {
        booked: service.locationDetail.gbttBookedDeparture || "????",
        expected: service.locationDetail.realtimeDeparture || "????",
        name: service.locationDetail.destination[0].description || "Unknown Destination",
        platform: service.locationDetail.platform || "1",
        operator: service.atocName || "Unknown Operator"
      }})
    
    const firstService = json.services[0]
    const serviceUid = firstService.serviceUid
    const date = firstService.runDate.replace(/-/g,"/")
    
    const serviceResponse = await fetch(`https://api.rtt.io/api/v1/json/service/${serviceUid}/${date}`, {headers: headers})
    
    const serviceJson = await serviceResponse.json()
    
    response["first"] = {
      operator: serviceJson.atocName,
      stops: serviceJson.locations
        .map((location: any) => { return {
          booked: location.gbttBookedDeparture || location.gbttBookedArrival || "????",
          expected: location.realtimeDeparture || location.realtimeArrival || "????",
          name: location.description || "Unknown Location",
          platform: location.platform || "1"
        }})
    }

    response["time"] = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  return res.json(response)
});

app.listen(8000);
console.log(`Server is running on http://localhost:8000`);