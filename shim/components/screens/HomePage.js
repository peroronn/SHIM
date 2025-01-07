import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Linking } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getalerttime, getNotificationItem, updatecleartext, getcleartext } from '../database';

const HomePage = ({ navigation }) => {
  const [iconName, setIconName] = useState('bell');

  useFocusEffect(
    React.useCallback(() => {
      const checkNotificationStatus = async () => {
        try {
          // Get the cleartext value and notification item from the database
          const alertTimeResult = await getalerttime();
          const notificationItem = await getNotificationItem();
          const cleartextResult = await getcleartext();

          if (alertTimeResult.length > 0) {
            const cleartext = cleartextResult[0].cleartext;

            // Check if cleartext is 1 and notificationItem exists
            if (cleartext === 1 && notificationItem.length > 0) {
              setIconName('bell-badge-outline');
            } else {
              setIconName('bell-outline');
            }
          }
        } catch (error) {
          console.error("Failed to check notification status:", error);
          setIconName('bell-outline'); // Default to "bell" if there is an error
        }
      };

      // Call the function to check the notification status
      checkNotificationStatus();
    }, [])
  );


  useEffect(() => {
    const checkAlertTime = async () => {
      try {
        // Get the alert time from the database
        const alertTimeResult = await getalerttime();

        if (alertTimeResult.length > 0) {
          const alertTime = alertTimeResult[0].alerttime; // Assuming the time is stored as a string like "12:30 PM"

          // Parse the alert time and subtract one minute to get 12:29 PM
          const alertDateTime = new Date();
          const [time, modifier] = alertTime.split(' ');

          let [hours, minutes] = time.split(':');
          if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
          }
          if (modifier === 'AM' && hours === '12') {
            hours = '00';
          }

          alertDateTime.setHours(hours);
          alertDateTime.setMinutes(minutes - 1); // Subtract one minute
          alertDateTime.setSeconds(0);

          // Get current time
          const currentTime = new Date();

          console.log("Current time For homepage.js is:", currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));
          console.log("Target time for homepage.js is:", alertDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }));

          // Compare current time with target time (12:29 PM)
          if (
            currentTime.getHours() === alertDateTime.getHours() &&
            currentTime.getMinutes() === alertDateTime.getMinutes()
          ) {
            // Update cleartext to 1 if the times match
            await updatecleartext(1);
            setIconName('bell-badge-outline');
            console.log("Cleartext updated to 1");
          }
        }
      } catch (error) {
        console.error("Failed to check alert time:", error);
      }
    };

    // Check the time every minute
    const intervalId = setInterval(checkAlertTime, 60000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleHelpPress = () => {
    const url = 'mailto:abc@gmail.com?subject=Request%20Help&body=Hello,%0A%0AI%20need%20assistance%20with%20the%20application.%20Please%20help.%0A%0AThank%20you.';
    Linking.openURL(url).catch((err) => console.error('Failed to open email client:', err));
  };

  return (
    <View style={styles.container}>
      {/* Set the status bar style */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          
          <Text style={styles.headerTitle}>SHIM</Text>
        </View>
        <TouchableOpacity style={styles.headericon} onPress={() => navigation.navigate('Notification')}>
          <MaterialCommunityIcons name={iconName} size={40} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('In', { title: 'IN' })}
        >
          <MaterialCommunityIcons name="package-down" size={40} color="#fff" />
          <Text style={styles.buttonText}>IN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Out')}>
          <MaterialCommunityIcons name="package-up" size={40} color="#fff" />
          <Text style={styles.buttonText}>OUT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Edit')}>
          <MaterialCommunityIcons name="file-edit" size={40} color="#fff" />
          <Text style={styles.buttonText}>EDIT HISTORY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditName')}>
          <MaterialCommunityIcons name="file-edit" size={40} color="#fff" />
          <Text style={styles.buttonText}>EDIT NAME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Alert')}>
          <MaterialCommunityIcons name="bell" size={40} color="#fff" />
          <Text style={styles.buttonText}>SET ALERT</Text>
        </TouchableOpacity>
       
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Report')}>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" />
          <Text style={styles.buttonText}>REPORT</Text>
        </TouchableOpacity>
      </View>

      {/* Footer with Settings and Help buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Setting')}>
          <MaterialCommunityIcons name="cog" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Setting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleHelpPress}>
          <MaterialCommunityIcons name="help-circle" size={30} color="#fff" />
          <Text style={styles.footerButtonText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 30,
    
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    backgroundColor: '#61A7E8',
    width: '40%',       // Set a fixed width for all buttons
    height: 130,        // Set a fixed height for all buttons
    margin: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    lineHeight: 18, // Ensure the line height matches the font size
    textAlign: 'center',
    flexWrap: 'nowrap', // Prevent text from wrapping to the next line
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#61A7E8',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    padding: 12,
    backgroundColor: '#61A7E8',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headericon: {
    marginRight: 15,
  }

});

export default HomePage;
