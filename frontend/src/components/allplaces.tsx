import { useEffect, useState } from "react";
import { getAllLocations } from "../api/geo_utils";

interface LocationData {
  ucla_name: string;
  address: string;
  coordinates: string;
  image_storage: string;
  views: number;
  ranking: number;
  likes: number;
  dislikes: number;
  comments: string[];
}

export default function Places() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLocations = async () => {
        const response = await getAllLocations();
        setLocations(response);
    };

    fetchLocations();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1>Locations</h1>
      <div className="locations-list">
        {locations.map((location, index) => (
          <div key={index} className="location-card">
            <h2>{location.ucla_name}</h2>
            <img src={`data:image/jpeg;base64,${location.image_storage}`} alt="Location Picture"/>
            <p><strong>Address:</strong> {location.address}</p>
            <p><strong>Coordinates:</strong> {location.coordinates}</p>
            <p><strong>Views:</strong> {location.views}</p>
            <p><strong>Ranking:</strong> {location.ranking}</p>
            <p><strong>Likes:</strong> {location.likes} | <strong>Dislikes:</strong> {location.dislikes}</p>
            <p><strong>Comments:</strong> {location.comments.length}</p>
            <div className="comments">
              {location.comments.map((comment, i) => (
                <p key={i}>- {comment}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
