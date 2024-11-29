/* eslint-disable prettier/prettier */

import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch, fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/types";

const Rides = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/(api)/ride/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Ensure response is an array, if not, convert it or use empty array
      const ridesData = Array.isArray(response)
        ? response
        : response?.data
          ? response.data
          : [];

      console.log("Fetched rides:", ridesData); // Debug log
      setRides(ridesData);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setRides([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRides();
    setRefreshing(false);
  }, [fetchRides]);

  useEffect(() => {
    if (user?.id) {
      fetchRides();
    }
  }, [user?.id, fetchRides]);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  // Ensure we have an array before rendering
  const ridesList = Array.isArray(rides) ? rides.slice(0, 5) : [];

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={ridesList}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item) =>
          item.ride_id?.toString() || Math.random().toString()
        }
        className="px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Rides;
