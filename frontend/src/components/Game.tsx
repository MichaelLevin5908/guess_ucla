import React, { useState, useEffect } from "react";
//import { useAuth } from "../context/AuthContext";
//import { useNavigate } from "react-router-dom";
import "../App.css"; // Use the same styles as the login page

const Game: React.FC = () => {
  //const { currentProfile, logout } = useAuth();

  const overlayImagePath = "/data/ucla_map_hires.png";
  const base64Image = "/data/fummy_picture.png"; // Dummy placeholder until we get the MongoDB hooked up
  const targetPoint = {lat: 34.070954, lon: -118.444762};

  const scaleFactor = 1.7; // Matches the overlay hover effect

  // State to store the marker position (click and hover)
  const [marker, setMarker] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const [hoverMarker, setHoverMarker] = useState<{ x: number; y: number } | null>(null);

  const overlayImage = document.querySelector(".overlay-image");
  const imageWidth = overlayImage?.clientWidth ?? 0;
  const imageHeight = overlayImage?.clientHeight ?? 0;

  // Function to transform pixel (X, Y) to latitude/longitude
  const transformToLatLon = (x: number, y: number) => {
    // Reference points (0,0) -> (1,1) for normalized coordinates
    const p1 = { x: 0, y: 0, lat: 34.079898, lon: -118.460099 };
    const p2 = { x: 1, y: 1, lat: 34.061762, lon: -118.432620 };

    const lat = p1.lat + y * (p2.lat - p1.lat);  // Use normalized Y
    const lon = p1.lon + x * (p2.lon - p1.lon);  // Use normalized X

    return { lat, lon };
  };

  // Recalculate marker position on window resize (keeps marker aligned)
  useEffect(() => {
    const handleResize = () => {
      if (marker) {
        setMarker({ ...marker }); // Force update to apply new scaled position
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [marker]);

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
        const score = distance >= 1.8 ? 0 : 5000 * (1 - distance / 1.8)**2;

        return score;
    }


  // Handle submission of the guess (dummy example)
  const handleSubmitGuess = () => {
    if (marker) {
      calculateDistanceAndScore(marker, targetPoint);
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
          <img src={base64Image} alt="Main" className="base-image" />

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

            {/* The Button Under the Map */}
            <button
              className="submit-guess-btn"
              disabled={!marker}
              onClick={handleSubmitGuess}
            >
              {marker ? "Submit Your Genius Guess" : "Place a marker to submit your guess"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
