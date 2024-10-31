/* eslint-disable prettier/prettier */
// import { icons } from "@/constants";
// import { calculateRegion, generateMarkersFromData } from "@/lib/map";
// import { useDriverStore, useLocationStore } from "@/store";
// import { MarkerData } from "@/types/types";
// import { useEffect, useState } from "react";
// import { Text, View } from "react-native";
// import MapView, {
//   Marker,
//   PROVIDER_DEFAULT,
//   PROVIDER_GOOGLE,
// } from "react-native-maps";

// const drivers = [
//   {
//     id: "1",
//     first_name: "James",
//     last_name: "Wilson",
//     profile_image_url:
//       "https://people.com/thmb/f_hjLzAkiESUeYXzFWIrmU2Y3cw=/4000x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(764x99:766x101)/beau-joaquin-phoenix-011023-2-56d040dc1cb746b99602afff3ce558b3.jpg",
//     car_image_url:
//       "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
//     car_seats: 4,
//     rating: "4.80",
//   },
//   {
//     id: "2",
//     first_name: "Patrik",
//     last_name: "Bateman",
//     profile_image_url:
//       "https://images.immediate.co.uk/production/volatile/sites/3/2023/12/american-psycho-patrick-bateman-christian-bale-74e5e71.jpg?quality=90&resize=556,505",
//     car_image_url:
//       "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
//     car_seats: 5,
//     rating: "4.60",
//   },
//   {
//     id: "3",
//     first_name: "Michael",
//     last_name: "Johnson",
//     profile_image_url:
//       "https://i.pinimg.com/736x/d2/8f/6b/d28f6b68f04abaad816124f778bc6b41.jpg",
//     car_image_url:
//       "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
//     car_seats: 4,
//     rating: "4.70",
//   },
//   {
//     id: "4",
//     first_name: "Robert",
//     last_name: "Green",
//     profile_image_url:
//       "https://variety.com/wp-content/uploads/2020/01/morbius-morbius-trlr-01687_r-e1609287193753.jpg",
//     car_image_url:
//       "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
//     car_seats: 4,
//     rating: "4.90",
//   },
// ];

// function Map() {
//   const {
//     userLongitude,
//     userLatitude,
//     destinationLatitude,
//     destinationLongitude,
//   } = useLocationStore();

//   const { selectedDriver, setDrivers } = useDriverStore();
//   const [markers, setMarkers] = useState<MarkerData[]>([]);

//   const region = calculateRegion({
//     userLatitude,
//     userLongitude,
//     destinationLatitude,
//     destinationLongitude,
//   });

//   useEffect(() => {
//     setDrivers(drivers);
//     if (Array.isArray(drivers)) {
//       if (!userLatitude || !userLongitude) return;
//       const newMakers = generateMarkersFromData({
//         data: drivers,
//         userLatitude,
//         userLongitude,
//       });
//       setMarkers(newMakers);
//     }
//   }, [drivers]);

//   return (
//     <MapView
//       provider={PROVIDER_GOOGLE}
//       style={{
//         width: "100%",
//         height: "100%",
//         borderRadius: 16,
//       }}
//       //className="w-full h-full rounded-2xl"
//       tintColor="black"
//       mapType="mutedStandard"
//       showsPointsOfInterest={false}
//       initialRegion={region}
//       showsUserLocation={true}
//       userInterfaceStyle="light"
//     >
//       {markers.map((marker) => (
//         <Marker
//           key={marker.id}
//           coordinate={{
//             latitude: marker.latitude,
//             longitude: marker.longitude,
//           }}
//           title={marker.title}
//           image={
//             selectedDriver === marker.id ? icons.selectedMarker : icons.marker
//           }
//         />
//       ))}
//     </MapView>
//   );
// }

// export default Map;

/* eslint-disable prettier/prettier */
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/types";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";

function Map() {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);
  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
      }}
      //className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}
    </MapView>
  );
}

export default Map;
