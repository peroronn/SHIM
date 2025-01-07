import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getRoomsFromDatabase, getLocationsFromDatabase, getInOutCount, getNextItemId, addInOutToDatabase, addItemToDatabase, addItemDetailToDatabase } from '../database';
import {
  Row,
  Table,
  Rows,
} from 'react-native-table-component';
import { format } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BackHandler } from 'react-native';


const InPage = () => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [alertQuantity, setAlertQuantity] = useState('');
  const [tableData, setTableData] = useState([]);
  const navigation = useNavigation();
  const [inoutId, setInOutId] = useState(1);  // State to hold the ID number
  const [itemid, setItemId] = useState(0);  // State to hold the ID number


  // Room dropdown state
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomValue, setRoomValue] = useState(null);
  const [rooms, setRooms] = useState([]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [locations, setLocations] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const formattedDate = format(new Date(), 'dd/MM/yyyy');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        // Fetch rooms
        const fetchedRooms = await getRoomsFromDatabase();
        setRooms(
          fetchedRooms.map((room) => ({
            label: room.roomname,
            value: room.roomid,
          }))
        );

        // Fetch locations if a room is selected
        if (roomValue) {
          const fetchedLocations = await getLocationsFromDatabase(roomValue);
          setLocations(
            fetchedLocations.map((location) => ({
              label: location.locationname,
              value: location.locationid,
            }))
          );
        }

        // Fetch InOutCount
        const count = await getInOutCount();
        setInOutId(count + 1);
      };

      fetchData();
    }, [roomValue])
  );



  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      const fetchedRooms = await getRoomsFromDatabase();
      setRooms(
        fetchedRooms.map((room) => ({
          label: room.roomname,
          value: room.roomid,  // Using roomid as the value
        }))
      );
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchInOutCount = async () => {
      try {
        const count = await getInOutCount();
        const countitem = await getNextItemId();
        setInOutId(count + 1);
        setItemId(countitem +1);
        console.log("InOut Count:", count);
        // You can use the count in your component's state or UI here
      } catch (error) {
        console.error("Error fetching inout count:", error);
      }
    };

    fetchInOutCount();
  }, []);


  useEffect(() => {
    const total = tableData.reduce((sum, item) => sum + parseInt(item[3], 10), 0);
    setTotalQuantity(total);
  }, [tableData]);

  // Fetch locations when a room is selected
  useEffect(() => {
    if (roomValue) {
      const fetchLocations = async () => {
        const fetchedLocations = await getLocationsFromDatabase(roomValue);
        setLocations(
          fetchedLocations.map((location) => ({
            label: location.locationname,
            value: location.locationid, // Using locationid as the value
          }))
        );
      };

      fetchLocations();
    } else {
      setLocations([]);
    }
  }, [roomValue]);

  

  const handleAddItem = async () => {
    if (!roomValue) {
      Alert.alert("Validation Error", "Please select a room.");
      return;
    }
    if (!locationValue) {
      Alert.alert("Validation Error", "Please select a location.");
      return;
    }
    if (!itemName.trim()) {
      Alert.alert("Validation Error", "Please enter an item name.");
      return;
    }
    if (!quantity.trim()) {
      Alert.alert("Validation Error", "Please enter the quantity.");
      return;
    }

    setItemId(itemid + 1);

    // Get the room and location names
    const roomName = rooms.find(room => room.value === roomValue)?.label || '';
    const locationName = locations.find(location => location.value === locationValue)?.label || '';
    const locationId = locationValue; // Store locationId directly

    // Add item to table data including itemid, roomName, locationName, and locationId
    const newItem = [
      itemName,
      expiryDate || "N/A",
      alertQuantity || "N/A",
      quantity,
      roomName, 
      locationName, 
      itemid,
      locationId  // Store locationId in the data
    ];
    setTableData([...tableData, newItem]);

    // Clear input fields after adding
    handleCancel();
  };


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setExpiryDate(format(date, 'dd/MM/yyyy'));  // Format the date as 'DD/MM/YYYY'
    hideDatePicker();
  };

  const handleSaveData = async () => {
    try {
      // Insert into `inout` table
      await addInOutToDatabase(inoutId, 'IN', formattedDate, totalQuantity);

      // Insert into `item` and `itemdetail` tables for each row in tableData
      for (let item of tableData) {
        const [itemName, expDate, alertQuantity, quantity, roomName, locationName, itemid, locationId] = item;
        


        if (locationId) {
          // Insert into `item` table
          await addItemToDatabase(
            itemid,
            locationId,  // Use the stored locationId
            itemName,
            quantity,
            alertQuantity === 'N/A' ? null : alertQuantity,
            expDate === 'N/A' ? null : expDate
          );

          // Insert into `itemdetail` table
          await addItemDetailToDatabase(itemid, inoutId, quantity);
        } else {
          console.error("Error: Location ID not found for location name:", locationName);
        }
      }

      Alert.alert("Success", "Data saved successfully.");
      // Reset the states after saving
      setTableData([]);
      setRoomValue(null);
      setLocationValue(null);
    //  navigation.navigate('In');
      navigation.navigate('In');


    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "There was an error saving the data.");
    }
  };



  // Clear inputs on cancel
  const handleCancel = () => {
    setItemName('');
    setQuantity('');
    setExpiryDate('');
    setAlertQuantity('');
  };

  return (
    <View style={styles.container}>
      
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="package-down" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>In</Text>
        </View>
        <TouchableOpacity onPress={handleSaveData}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
        
      </View>


    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.datetitleBar}>
        <Text style={styles.dateText}>Date: {formattedDate}</Text>
        <Text style={styles.dateText}>ID: {inoutId}</Text>
      </View>
      <View style={styles.breakLine1} />

        
      {/* Room Section */}
      <View style={styles.row}>
        <DropDownPicker
          autoScroll
          autoScrollToValue={true} 
          open={roomOpen}
          value={roomValue}
          items={rooms}
          setOpen={setRoomOpen}
          setValue={setRoomValue}
          setItems={setRooms}
          style={styles.dropdown}
          placeholder="Select Room"
          containerStyle={{ width: '48.5%'}}
          textStyle={{ fontWeight: 'bold' }} // Ensures dropdown is on top when open
          placeholderStyle={{ fontWeight: 'bold' }} 
        />
        <DropDownPicker
          autoScroll
          autoScrollToValue={true} 
          open={locationOpen}
          value={locationValue}
          items={locations}
          setOpen={setLocationOpen}
          setValue={setLocationValue}
          setItems={setLocations}
          style={styles.dropdown}
          placeholder="Select Location"
          containerStyle={{ width: '48.5%' }}// Lower zIndex than Room when open
          placeholderStyle={{ fontWeight: 'bold' }} 
          textStyle={{ fontWeight: 'bold' }} 
        />
        
        </View>
    
      {/* Location Section */}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.newRoomButton}
          onPress={() => navigation.navigate('NewRoom')}
        >
          <Text style={styles.newButtonText}>+ New Room</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.newLocationButton}
          onPress={() => navigation.navigate('NewLocation')}
        >
          <Text style={styles.newButtonText}>+ New Location</Text>
        </TouchableOpacity>
      </View>
        
 


      <View style={styles.breakLine} />
      <View style = {styles.itemcontainer}>
      {/* Form Fields */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Item Name:</Text>
          <TextInput
            style={styles.textInput}
            value={itemName}
            onChangeText={setItemName}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Quantity:</Text>
          <TextInput
            style={styles.textInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Expiry Date:</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.textInput}>
            <Text style={styles.textdateInput}>{expiryDate || "DD/MM/YYYY"}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Alert Quantity:</Text>
          <TextInput
            style={styles.textInput}
            value={alertQuantity}
            onChangeText={setAlertQuantity}
            keyboardType="numeric"
          />
        </View>
      </View>
      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.breakLine1} />

      {/* Table Item Name, Exp Date, Alert qty and qty */}
      <View style = {styles.itemcontainer}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
          <Row
            data={['Item Name', 'Exp Date', 'Alert Qty', 'Qty']}
            style={styles.tableHeader}
            textStyle={styles.headerText}
            flexArr={[1.4, 0.8, 0.4, 0.4]}  // Setting the width ratio
          />
          <Rows
            data={tableData.map(([name, expDate, alertQty, qty, roomName, locationName, itemid]) => [
              <View>
                <Text style={styles.itemNameText}>{name}</Text>
                <Text style={styles.roomLocationText}>
                  {roomName}, {locationName}
                </Text>
              </View>,
              expDate,
              alertQty,
              qty
            ])}
            textStyle={styles.tableText}
            flexArr={[1.4, 0.8, 0.4, 0.4]}  // Setting the width ratio
          />
        </Table>
      </View>


        {/* Total Quantity */}
        
    </ScrollView>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Quantity: {totalQuantity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemcontainer: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 8,  // Adjust the space between icons and text if needed
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
  datetitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 16,
    paddingRight: 16,
  },
  
  dateText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  breakLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 1,
  },
  breakLine1: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  dropdownContainer: {
    flex: 1,
    fontWeight: 'bold',
    width: '100%'
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 28,  
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingTop: 3,
    paddingBottom: 3,
    paddingRight:5,
    paddingLeft: 7,
    fontSize: 16,
    
  },
  textdateInput: {
    flex: 2,
    paddingTop: 3,
    paddingBottom: 3,
    paddingRight:5,
    paddingLeft: 7,
    fontSize: 16,
    
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#61A7E8',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  newRoomButton: {
    backgroundColor: '#61A7E8',
    width: '48.5%',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    padding: 10,
    marginRight: 10,
  },
  newLocationButton: {
    backgroundColor: '#61A7E8',
    width: '48.5%',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#61A7E8',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  tableHeader: {
    height: 45,
    backgroundColor: '#f1f8ff',
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableText: {
    fontSize: 16,
    textAlign: 'center',
    paddingLeft: 1,
    paddingRight :1,
  },
  itemNameText: {
    fontSize: 20, // Normal font size for the item name
    fontWeight: 'bold', // Bold for emphasis
    paddingLeft: 5,
  },
  roomLocationText: {
    fontSize: 14, // Smaller font size for room and location
    color: 'gray', // Gray color for room and location details
    paddingLeft: 5,
  },
});

export default InPage;
