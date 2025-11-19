import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";

export default function CalendarScreen() {
  // -------------------------
  // Get client IDs from app.json
  // -------------------------

  // -------------------------
  // Local State
  // -------------------------
  const [accessToken, setAccessToken] = useState(null);
  const [events, setEvents] = useState({});
  const [eventList, setEventList] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toISOString().split("T")[0]
  );

  // -------------------------
  // Google Authentication Hook
  // -------------------------
  const config = Constants.expoConfig ?? Constants.manifest;


  const EXPO_CLIENT_ID = config?.extra?.expoClientId;
  const IOS_CLIENT_ID = config?.extra?.iosClientId;
  const WEB_CLIENT_ID = config?.extra?.webClientId;

  console.log("CONFIG EXTRA:", config?.extra);
  console.log("IOS_CLIENT_ID:", IOS_CLIENT_ID);


  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });


  // -------------------------
  // Handle Response
  // -------------------------
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      setAccessToken(authentication.accessToken);
    } else if (response?.type === "error") {
      Alert.alert("Google Sign-In Error", "Failed to authenticate");
    }
  }, [response]);

  // -------------------------
  // Fetch Events
  // -------------------------
  useEffect(() => {
    if (!accessToken) return;

    async function loadEvents() {
      try {
        const res = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const data = await res.json();
        if (data.error) {
          console.log(data.error);
          Alert.alert("Calendar Error", data.error.message);
          return;
        }

        const markers = {};
        data.items?.forEach((event) => {
          const date =
            event.start?.date || event.start?.dateTime?.split("T")[0];
          if (date) markers[date] = { marked: true, dotColor: "#10B981" };
        });

        setEvents(markers);
        setEventList(data.items || []);
      } catch (err) {
        console.error(err);
        Alert.alert("Error fetching events", err.message);
      }
    }

    loadEvents();
  }, [accessToken]);

  // Filter events by selected day
  const eventsForSelectedDay = eventList.filter(
    (event) =>
      (event.start?.date ||
        event.start?.dateTime?.split("T")[0]) === selectedDay
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <View style={styles.container}>
      {!accessToken ? (
        <>
          <Text style={styles.text}>Connect your Google Calendar</Text>
          <Button
            disabled={!request}
            title="Sign in with Google"
            onPress={() => promptAsync({ useProxy: true })}
          />
        </>
      ) : (
        <>
          <Calendar
            markedDates={{
              ...events,
              [selectedDay]: {
                ...(events[selectedDay] || {}),
                selected: true,
                selectedColor: "#10B981",
              },
            }}
            onDayPress={(day) => setSelectedDay(day.dateString)}
          />

          <Text style={styles.heading}>Events on {selectedDay}</Text>

          <ScrollView style={{ marginTop: 10 }}>
            {eventsForSelectedDay.length > 0 ? (
              eventsForSelectedDay.map((event, i) => (
                <View key={i} style={styles.eventContainer}>
                  <Text style={styles.eventTitle}>
                    {event.summary || "No Title"}
                  </Text>
                  {event.start?.dateTime && (
                    <Text style={styles.eventTime}>
                      {new Date(event.start.dateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noEventText}>No events</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  text: { fontSize: 20, marginBottom: 20, textAlign: "center" },
  heading: { fontSize: 18, marginTop: 20, fontWeight: "bold" },
  eventContainer: {
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  eventTitle: { fontSize: 16, fontWeight: "600" },
  eventTime: { fontSize: 14, color: "#065F46" },
  noEventText: { fontSize: 16, fontStyle: "italic" },
});
