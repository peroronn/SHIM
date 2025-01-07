import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';  
import { getalerttime, updateAlertTime } from '../database';

const SettingPage = ({ navigation }) => {
  const [notificationTime, setNotificationTime] = useState(''); // State to hold the notification time
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // State to manage DateTimePicker visibility

  // Fetch the notification time from the database when the component mounts
  useEffect(() => {
    const fetchNotificationTime = async () => {
      try {
        const result = await getalerttime();
        console.log(result);

        if (result.length > 0) {
          setNotificationTime(result[0].alerttime);  // Set the notification time from the database
        } 
      } catch (error) {
        console.error("Failed to fetch notification time:", error);
      }
    };

    fetchNotificationTime();
  }, []);

  // Function to show the date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Function to hide the date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Function to handle the time picked by the user
  const handleConfirm = async (date) => {
    const selectedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotificationTime(selectedTime); // Update state with the selected time
    hideDatePicker(); // Hide the date picker

    try {
      await updateAlertTime(selectedTime); // Update the time in the database
      console.log("Alert time updated successfully!");
    } catch (error) {
      console.error("Failed to update alert time:", error);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="cog" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Setting</Text>
        </View>
      </View>

      {/* Notification Time Section */}
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notification Time</Text>
        <TouchableOpacity style={styles.timeButton} onPress={showDatePicker}>
          <Text style={styles.timeText}>{notificationTime || 'Loading...'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.breakLine} />

      {/* DateTimePickerModal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
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
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  iconSpacing: {
    marginLeft: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    
  },
  settingText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#61A7E8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  timeText: {
    fontSize: 16,
    color: '#61A7E8',
  },
  breakLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 6,
  },
});

export default SettingPage;
