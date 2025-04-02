import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Update the container style to fill the parent container
const containerStyle = {
    width: "100%",
    height: "100%",
};

// Replace these with the accurate coordinates for your address
const center = {
    lat: 49.9994881, // Approximate latitude for Dreieich
    lng: 8.7123764, // Approximate longitude for Dreieich
};

function GoogleMaps() {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS,
    });

    const [map, setMap] = React.useState(null);

    const onLoad = React.useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = React.useCallback(() => {
        setMap(null);
    }, []);

    return isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17} onLoad={onLoad} onUnmount={onUnmount}>
            {/* Add a marker at the center */}
            <Marker position={center} />
        </GoogleMap>
    ) : (
        <></>
    );
}

export default React.memo(GoogleMaps);
