import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createTables } from './components/database';
import HomePage from './components/screens/HomePage';
import SettingPage from './components/screens/SettingPage';
import InPage from './components/screens/InPage';
import OutPage from './components/screens/OutPage';
import EditPage from './components/screens/EditPage';
import EditHistoryDataPage from './components/screens/EditHistoryDataPage';
import AlertPage from './components/screens/AlertPage';
import DeletePage from './components/screens/DeletePage';
import ReportPage from './components/screens/ReportPage';
import NewRoomPage from './components/screens/NewRoomPage';
import NewLocationPage from './components/screens/NewLocationPage';
import NotificationPage from './components/screens/NotificationPage';
import EditNamePage from './components/screens/EditNamePage';
import ReportAllPage from './components/reportscreens/ReportAllPage';
import ReportIncomingPage from './components/reportscreens/ReportIncomingPage';
import ReportOutgoingPage from './components/reportscreens/ReportOutgoingPage';
import ReportItemPage from './components/reportscreens/ReportItemPage';
import ReportLocationPage from './components/reportscreens/ReportLocationPage';
import ReportRoomPage from './components/reportscreens/ReportRoomPage';
import { getalerttime, getNotificationItemname, getcleartext } from './components/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const Stack = createStackNavigator();

const App = () => {

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    createTables(); // Create tables on app start
  }, []);
  
  useEffect(() => {
    const checkTimeAndSendNotification = async () => {
      try {
        const alertTimeResult = await getalerttime();
        const cleartextResult = await getcleartext();
        
        const notificationItem = await getNotificationItemname();
        console.log("Fetched Notification Item:", notificationItem);

        if (alertTimeResult.length > 0) {
          const alertTime = alertTimeResult[0].alerttime;
          const cleartext = cleartextResult[0].cleartext;

          const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          console.log("Current Time for App.js : ", currentTime);
          console.log("Alert Time for App.js : ", alertTime);
          console.log("Clear Text for App.js : ", cleartext);
          console.log("notificationItem.length for App.js : ", notificationItem.length);


          if (cleartext === 1 && notificationItem.length > 0 && currentTime === alertTime) {
            await schedulePushNotification(notificationItem);
          }
        }
      } catch (error) {
        console.error("Error checking time and sending notification:", error);
      }
    };

    const intervalId = setInterval(checkTimeAndSendNotification, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Setting" component={SettingPage} options={{ headerShown: false }} />
        <Stack.Screen name="In" component={InPage} options={{   headerShown: false }} />
        <Stack.Screen name="Out" component={OutPage} options={{  headerShown: false }} />
        <Stack.Screen name="Edit" component={EditPage} options={{ headerShown: false }} />
        <Stack.Screen name="EditHistoryData" component={EditHistoryDataPage}  options={{ title: 'EditHistory', headerShown: false }}/>
        <Stack.Screen name="EditName" component={EditNamePage}  options={{ headerShown: false }}/>
        <Stack.Screen name="Alert" component={AlertPage} options={{  headerShown: false }} />
        <Stack.Screen name="Delete" component={DeletePage} options={{ title: 'Delete' }} />
        <Stack.Screen name="Report" component={ReportPage} options={{  headerShown: false }} />
        <Stack.Screen name="NewRoom" component={NewRoomPage} options={{ headerShown: false }} />
        <Stack.Screen name="NewLocation" component={NewLocationPage} options={{ title: 'New Location', headerShown: false }} />
        <Stack.Screen name="ReportAll" component={ReportAllPage}  options={{ headerShown: false }}/>
        <Stack.Screen name="ReportOutgoing" component={ReportOutgoingPage} options={{  headerShown: false }} />
        <Stack.Screen name="ReportIncoming" component={ReportIncomingPage} options={{ headerShown: false }} />
        <Stack.Screen name="ReportItem" component={ReportItemPage} options={{  headerShown: false }} />
        <Stack.Screen name="ReportLocation" component={ReportLocationPage} options={{  headerShown: false }} />
        <Stack.Screen name="ReportRoom" component={ReportRoomPage} options={{  headerShown: false }} />
        <Stack.Screen name="Notification" component={NotificationPage} options={{  headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

async function schedulePushNotification(notificationItem) {
  if (notificationItem.length > 0) {
    const itemNames = notificationItem.map(item => item.displayName).join('');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Low Stock or Expiry Alert!",
        body: `Items at risk - ${itemNames}`,
        data: { data: notificationItem },
        sound: 'default',
      },
      trigger: null, // Trigger immediately
    });
  } else {
    console.log("No items to notify.");
  }
}

 

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
export default App;
