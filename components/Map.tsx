/* eslint-disable prettier/prettier */
import { Text, View } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
function Map() {
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
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      <Text>Hello</Text>
    </MapView>
  );
}

export default Map;
