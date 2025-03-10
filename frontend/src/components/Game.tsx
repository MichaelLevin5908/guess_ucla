import React, { useState, useEffect } from "react";
//import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../App.css"; // Use the same styles as the login page
import { getTotalLocations, getLocationsByIndices } from "../api/geo_utils";


function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296; // LCG formula
    return (seed >>> 0) / 4294967296; // Convert to [0,1)
  };
}

function generateRandomIndices(seed: number, count: number, max: number) {
  const indices = Array.from({ length: max }, (_, i) => i);
  const random = seededRandom(seed);  

  // Fisher-Yates shuffle
  for (let i = max - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count);
}

const hashStringToNumber = (str: string | null | undefined, seed = 31): number => {
  if (!str) return 0; // Handle null, undefined, and empty strings safely

  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    hash = (hash * seed + str.charCodeAt(i)) % 1_000_000_007; // Modulo for overflow safety
  }

  return hash;
};

const Game: React.FC = () => {
  //const { currentProfile, logout } = useAuth();
  interface LocationData {
    ucla_name: string;
    address: string;
    coordinates: string;
    parsedCoordinates: { lat: number; lon: number };
    image_storage: string;
    views: number;
    ranking: number;
    likes: number;
    dislikes: number;
    comments: string[];
  }
  const DEFAULT_LOCATION: LocationData = {
    ucla_name: "Unknown Location",
    address: "No address available",
    coordinates: "lat: 0, lon: 0",
    parsedCoordinates: { lat: 0, lon: 0 },
    image_storage: "", // Empty Base64 string
    views: 0,
    ranking: 1000,
    likes: 0,
    dislikes: 0,
    comments: [],
};
  const [searchParams] = useSearchParams();

  // Get query parameters
  const lobby = hashStringToNumber(searchParams.get("lobby")); // "lobby_1741563940914"
  const seed = lobby ? lobby : Date.now();
  const navigate = useNavigate(); // Initialize navigation
  const [totalLocations, setTotalLocations] = useState<number | null>(null);
  const NUM_ROUNDS = 5;

  const [roundScores, setRoundScores] = useState<number[]>(Array(NUM_ROUNDS).fill(null));
  const [round, setRound] = useState<number>(0);
  const [roundLocations, setRoundLocations] = useState<number[]>([])
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  
  const overlayImagePath = "/data/ucla_map_hires.png";
  const base64Image = location?.image_storage ?? ""; // ✅ Defaults to empty string if null
  const targetPoint = location?.parsedCoordinates ?? { lat: 0, lon: 0 }; // ✅ Default coordinates

  const scaleFactor = 1.7; // Matches the overlay hover effect

  // State to store the marker position (click and hover)
  const [marker, setMarker] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const [hoverMarker, setHoverMarker] = useState<{ x: number; y: number } | null>(null);
  const [locationMarker, setLocationMarker] = useState<{ x: number; y: number } | null>(null);

  const overlayImage = document.querySelector(".overlay-image");
  const imageWidth = overlayImage?.clientWidth ?? 0;
  const imageHeight = overlayImage?.clientHeight ?? 0;

  const [buttonPhase, setButtonPhase] = useState<number>(0);

  const getButtonText = (marker: { x: number; y: number } | null, phase: number) => {
      if (!marker)
      {
        return "Place a marker to submit your guess";
      }
      else if (phase === 0)
      {
        return "Submit your genius guess";
      }
      else
      {
        return "Next Round";
      }
  };
  // Function to transform pixel (X, Y) to latitude/longitude
  const transformToLatLon = (x: number, y: number) => {
    // Reference points (0,0) -> (1,1) for normalized coordinates
    const p1 = { x: 0, y: 0, lat: 34.079898, lon: -118.460099 };
    const p2 = { x: 1, y: 1, lat: 34.061762, lon: -118.432620 };

    const lat = p1.lat + y * (p2.lat - p1.lat);  // Use normalized Y
    const lon = p1.lon + x * (p2.lon - p1.lon);  // Use normalized X

    return { lat, lon };
  };

  const transformToXY = (lat: number, lon: number) => {
    // Reference points (0,0) -> (1,1) for normalized coordinates
    const p1 = { x: 0, y: 0, lat: 34.079898, lon: -118.460099 };
    const p2 = { x: 1, y: 1, lat: 34.061762, lon: -118.432620 };

    const y = (lat - p1.lat) / (p2.lat - p1.lat);
    const x = (lon - p1.lon) / (p2.lon - p1.lon);

    return { x, y };
  };


  useEffect(() => {
    getTotalLocations().then((total) => {
        if (typeof total === "number" && total > 0) {
            setTotalLocations(total);
        } 
    });
  }, []);

  useEffect(() => {
    if (totalLocations !== null) {
        const fetchLocations = async () => {
            const newRoundLocations = generateRandomIndices(seed, NUM_ROUNDS, totalLocations);
            setRoundLocations(newRoundLocations);

            // Wait for `roundLocations` to be updated before fetching
            const data = await getLocationsByIndices(newRoundLocations);
            setLocations(data);
        };
        fetchLocations();
    }
  }, [totalLocations]);

  useEffect(() => {
    if (roundLocations.length > 0 && locations.length > round && locations[round] !== undefined) {
        setLocation(locations[round]);
    } 
}, [round, roundLocations, locations]);


  // Handle user click to place a marker
  const handleOverlayClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / rect.width;  // Normalize X (0 to 1)
    const clickY = (event.clientY - rect.top) / rect.height;  // Normalize Y (0 to 1)

    const { lat, lon } = transformToLatLon(clickX, clickY);
    setMarker({ x: clickX, y: clickY, lat, lon });
  };

  // Handle hover to move a temporary marker
  const handleOverlayHover = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const hoverX = (event.clientX - rect.left) / rect.width;  // Normalize X
    const hoverY = (event.clientY - rect.top) / rect.height;  // Normalize Y

    // Convert back to pixels, accounting for scaleFactor
    setHoverMarker({
      x: hoverX * rect.width / scaleFactor,
      y: hoverY * rect.height / scaleFactor
    });
  };

  // Remove hover marker when leaving overlay
  const handleOverlayLeave = () => {
    setHoverMarker(null);
  };

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of the Earth in miles
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

    function calculateDistanceAndScore(marker: { lat: number; lon: number }, targetPoint: { lat: number; lon: number }) {
        const distance = haversineDistance(marker.lat, marker.lon, targetPoint.lat, targetPoint.lon);
        const score = distance >= 1.5 ? 0 : 5000 * (1 - distance / 1.5)**2.5;

        return Math.floor(score);
    }


  // Handle submission of the guess (dummy example)
  const handleSubmitGuess = () => {
    if (marker && buttonPhase === 0) {
      setButtonPhase(1);
      const locationXY = transformToXY(targetPoint.lat, targetPoint.lon);
      setLocationMarker(locationXY);
      
      const score = calculateDistanceAndScore(marker, targetPoint);
      setRoundScores((prevScores) => {
        const newScores = [...prevScores];
        newScores[round] = score;
        return newScores;
      });
    }
    else if (marker && round < NUM_ROUNDS-1) {
      setRound(round+1);
      setMarker(null);
      setLocationMarker(null);
      setButtonPhase(0);
      setLocation(locations[round]);
    }
    else if (round >= NUM_ROUNDS-1)
    {
      navigate('/profile');
    }
  };

  return (
    <div
      className="game-page"
      style={{
        backgroundImage: `url('/data/ucla_marks.png')`,
        backgroundSize: "133px 76px", // Adjust image size
        backgroundPosition: "50px 50px",
        backgroundRepeat: "repeat",
        backgroundColor: "rgb(5, 162, 255)",
      }}
    >
      <div className="game-container">
        <div className="image-wrapper">
          {/* Base Image (background) */}
          <img src={`data:image/jpeg;base64,${base64Image}`} alt="Main" className="base-image" />

          {/* Overlay Container (the "map") + Button */}
          <div className="overlay">
            {/* The Map Image */}
            <img
              src={overlayImagePath}
              alt="Overlay"
              className="overlay-image"
              onClick={handleOverlayClick}
              onMouseMove={handleOverlayHover}
              onMouseLeave={handleOverlayLeave}
            />

            {/* Markers */}
            {marker && (
              <div
                className="marker"
                  style={{
                    left: `${marker.x * imageWidth}px`,
                    top: `${marker.y * imageHeight}px`,
                  }}
              />
            )}
            {hoverMarker && (
              <div
                className="hover-marker"
                style={{ left: `${hoverMarker.x}px`, top: `${hoverMarker.y}px` }}
              />
            )}
            {locationMarker && (
              <div
                className="loc-marker"
                style={{
                  left: `${locationMarker.x * imageWidth}px`,
                  top: `${locationMarker.y * imageHeight}px`,
                }}
              />
            )}
            {/* The Button Under the Map */}
            <button
              className="submit-guess-btn"
              disabled={!marker}
              onClick={handleSubmitGuess}
            >
              {getButtonText(marker, buttonPhase)}
            </button>
          </div>
        </div>
        <div className="score-display">
          {roundScores.map((score, index) => (
            <div key={index} className="score-oval">
              {score !== null ? score : "-"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
