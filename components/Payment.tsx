/* eslint-disable prettier/prettier */

import "react-native-get-random-values";
import { useAuth } from "@clerk/clerk-expo";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/types";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const createRideRecord = async () => {
    try {
      const response = await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: rideTime.toFixed(0),
          fare_price: parseInt(amount) * 100,
          payment_status: "paid",
          driver_id: driverId,
          user_id: userId,
        }),
      });

      if (!response) {
        throw new Error("Failed to create ride record");
      }

      return response;
    } catch (error) {
      console.error("Error creating ride record:", error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      const { error } = await initPaymentSheet({
        merchantDisplayName: "ShetraRides Inc.",
        intentConfiguration: {
          mode: {
            amount: parseInt(amount) * 200,
            currencyCode: "usd",
          },
          confirmHandler: async (paymentMethod, _, intentCreationCallback) => {
            try {
              // For testing: Simulate successful payment
              await createRideRecord();

              // Simulate successful payment intent
              intentCreationCallback({
                clientSecret: "dummy_secret_for_testing",
              });

              return;

              // Original Stripe implementation (commented out for testing)
              /*
              const { paymentIntent, customer } = await fetchAPI(
                "/(api)/(stripe)/create",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: fullName || email.split("@")[0],
                    email: email,
                    amount: amount,
                    paymentMethodId: paymentMethod.id,
                  }),
                }
              );

              if (paymentIntent.client_secret) {
                const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer,
                    client_secret: paymentIntent.client_secret,
                  }),
                });

                if (result.client_secret) {
                  await createRideRecord();

                  intentCreationCallback({
                    clientSecret: result.client_secret,
                  });
                }
              }
              */
            } catch (error) {
              console.error("Error in confirm handler:", error);
              Alert.alert(
                "Error",
                "Failed to process payment. Please try again."
              );
            }
          },
        },
        returnURL: "myapp",
      });

      if (error) {
        console.error("Error initializing payment sheet:", error);
        Alert.alert("Error", "Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Error in initializePaymentSheet:", error);
      Alert.alert("Error", "Failed to setup payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const openPaymentSheet = async () => {
    try {
      setLoading(true);

      // Since we're bypassing Stripe, just create the ride record directly
      await createRideRecord();
      setSuccess(true);

      // Original Stripe implementation (commented out for testing)
      /*
      const { error } = await presentPaymentSheet();
      if (error) {
        console.error("Payment sheet error:", error);
        Alert.alert(`Error`, "Payment failed. Please try again.");
      } else {
        setSuccess(true);
      }
      */
    } catch (error) {
      console.error("Error in openPaymentSheet:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
        disabled={loading}
      />
      <ReactNativeModal
        isVisible={success}
        onBackButtonPress={() => setSuccess(false)}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-bold mt-5">
            Ride Booked !
          </Text>
          <Text className="text-md text-general-200 font-semibold text-center mt-3">
            Thanks for your booking
          </Text>
          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
