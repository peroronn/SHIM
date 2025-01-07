import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { getRoomsFromDatabase, getLocationsFromDatabase, getItemsByLocation, updateRoomNameInDatabase, updateLocationNameInDatabase, updateItemNameInDatabase  } from '../database'; // Import both functions
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Import the package
import DropDownPicker from 'react-native-dropdown-picker';
import { useIsFocused } from '@react-navigation/native';

const EditNamePage = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('null'); // Default to 'Room'
  const [data, setData] = useState([]); // State to hold the fetched data
  const [tableData, setTableData] = useState([]); // State for displaying data in table format

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [open, setOpen] = useState(false); // State for controlling the dropdown
  const [selectedLocation, setSelectedLocation] = useState(null); // State for selected location
  const [locations, setLocations] = useState([]); // State to store locations data
  const [openRoomDropdown, setOpenRoomDropdown] = useState(false);
  const [openLocationDropdown, setOpenLocationDropdown] = useState(false);
  const isFocused = useIsFocused();

  

  const handleInputChange = (index, text) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index].inputValue = text; // Update the input value
      return newData;
    });
  };




  const handleSelection = (option) => {
    setSelectedOption(option);
    setSelectedRoom(null); // Reset selected room
    setSelectedLocation(null); // Reset selected location
    setData([]); // Clear previous data
    setTableData([]); // Clear table data
  };

  

  useEffect(() => {
    const fetchData = async () => {
      let result = [];

      if (selectedOption === 'Room') {
        result = await getRoomsFromDatabase();
        setTableData(result.map((item) => ({
          roomId: item.roomid,
          roomName: item.roomname,
          inputValue: item.roomname,
        })));
      } else if (selectedOption === 'Location' && selectedRoom) {
        result = await getLocationsFromDatabase(selectedRoom);
        setTableData(result.map(item => ({
          locationId: item.locationid,
          locationName: item.locationname,
          inputValue: item.locationname,
        })));
      }

      setData(result);
    };

    const fetchRooms = async () => {
      const roomsFromDb = await getRoomsFromDatabase();
      setRooms(roomsFromDb.map(room => ({ label: room.roomname, value: room.roomid })));
    };

    const fetchLocationsAndItems = async () => {
      if (selectedOption === 'Item' && selectedRoom) {
        const locationsFromDb = await getLocationsFromDatabase(selectedRoom);
        setLocations(locationsFromDb.map(location => ({ label: location.locationname, value: location.locationid })));
      }

      if (selectedOption === 'Item' && selectedLocation) {
        const itemsFromDb = await getItemsByLocation(selectedLocation);
        setTableData(itemsFromDb.map(item => ({
          itemId: item.itemid,
          itemName: item.itemname,
          inputValue: item.itemname,
        })));
      }
    };

    if (isFocused) {
      fetchData();
      fetchRooms();
      fetchLocationsAndItems();
    }
  }, [isFocused, selectedOption, selectedRoom, selectedLocation]);

  const handleSaveData = async () => {
    if (selectedOption === 'Room') {
      try {
        const updatedRooms = tableData.map((row) => ({
          roomName: row.inputValue, // Use the updated input value
          roomId: row.roomId,
        }));

        for (const { roomName, roomId } of updatedRooms) {
          await updateRoomNameInDatabase(roomId, roomName);
        }

        alert('Room names updated successfully.');
        setSelectedOption(null);

      } catch (error) {
        console.error('Error updating room names:', error);
        alert('Failed to update room names.');
      }
    } else if (selectedOption === 'Location') {
      try {
        const updatedLocations = tableData.map((row) => ({
          locationName: row.inputValue,
          locationId: row.locationId,
        }));

        for (const { locationName, locationId } of updatedLocations) {
          await updateLocationNameInDatabase(locationId, locationName);
        }

        alert('Location names updated successfully.');
        setSelectedOption(null);

      } catch (error) {
        console.error('Error updating location names:', error);
        alert('Failed to update location names.');
      }
    } else if (selectedOption === 'Item') {
      try {
        const updatedItems = tableData.map((row) => ({
          itemName: row.inputValue,
          itemId: row.itemId,
        }));

        for (const { itemName, itemId } of updatedItems) {
          await updateItemNameInDatabase(itemId, itemName);
        }

        alert('Item names updated successfully.');
        setSelectedOption(null);

      } catch (error) {
        console.error('Error updating item names:', error);
        alert('Failed to update item names.');
      }
    } else {
      alert('Please select "Room", "Location", or "Item" to update names.');
    }
  };







  return (
    <SafeAreaView  style={styles.container}>
      {/* Header with Edit and back icon */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-edit" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Edit Name</Text>
        </View>
        <TouchableOpacity onPress={handleSaveData}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Radio Button Selection */}
      <View style={styles.radioGroup}>
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleSelection('Room')}
        >
          <View style={[styles.radioCircle, selectedOption === 'Room' && styles.selectedRadioCircle]} />
          <Text style={styles.radioLabel}>Room</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleSelection('Location')}
        >
          <View style={[styles.radioCircle, selectedOption === 'Location' && styles.selectedRadioCircle]} />
          <Text style={styles.radioLabel}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.radioOption} 
          onPress={() => handleSelection('Item')}
        >
          <View style={[styles.radioCircle, selectedOption === 'Item' && styles.selectedRadioCircle]} />
          <Text style={styles.radioLabel}>Item</Text>
        </TouchableOpacity>
      </View>

      {selectedOption === 'Location' && (
        <>
          <View style={styles.breakLine} />
          <DropDownPicker
            autoScroll
            autoScrollToValue={true} // Ensures the selected value is fully visible
            open={open}
            value={selectedRoom}
            items={rooms}
            setOpen={setOpen}
            setValue={setSelectedRoom}
            placeholder="Select a Room"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer} // Adjust container style
            containerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText} // Adjust text style
          />


          {selectedRoom && (
            <KeyboardAwareScrollView 
              enableOnAndroid={true} 
              extraHeight={150} 
              style={styles.tableContainer}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                <Row data={['Location Name', 'Enter text to edit']} style={styles.header} textStyle={styles.headerText}/>
                
                {tableData.map((row, index) => (
                  <Row 
                    key={index}
                    data={[
                      <Text style={styles.tableText}>{row.locationName}</Text>,
                      <TextInput
                        style={styles.input}
                        value={row.inputValue}
                        onChangeText={(text) => handleInputChange(index, text)}
                      />
                    ]}
                  />
                ))}
              </Table>
            </KeyboardAwareScrollView>
          )}
        </>
      )}


      {selectedOption === 'Item' && (
        <>
        
          <View style={styles.breakLine} />
          {/* Labels for Room and Location Dropdowns */}
          {/* Room and Location Dropdowns */}
          <View style={styles.dropdownRow}>
             <DropDownPicker
              open={openRoomDropdown}
              value={selectedRoom}
              items={rooms}
              setOpen={setOpenRoomDropdown}
              setValue={setSelectedRoom}
              placeholder="Select a Room"
              style={[styles.dropdown, styles.dropdownHalf]}
              dropDownContainerStyle={styles.dropDownContainer}
              containerStyle={styles.dropdownitemContainer}
              textStyle={styles.dropdownText}
              onOpen={() => setOpenLocationDropdown(false)} // Close location dropdown when room dropdown is opened
            />

            <DropDownPicker
              open={openLocationDropdown}
              value={selectedLocation}
              items={locations}
              setOpen={setOpenLocationDropdown}
              setValue={setSelectedLocation}
              placeholder="Select a Location"
              style={[styles.dropdown, styles.dropdownHalf]}
              dropDownContainerStyle={styles.dropDownContainer}
              containerStyle={styles.dropdownitemContainer}
              textStyle={styles.dropdownText}
              onOpen={() => setOpenRoomDropdown(false)} // Close room dropdown when location dropdown is opened
              disabled={!selectedRoom} // Disable location dropdown until a room is selected
            />
          </View>
          <View style={styles.breakLine1} />

          {/* Table displaying Items */}
          {selectedLocation && (
            <KeyboardAwareScrollView 
              enableOnAndroid={true} 
              extraHeight={150} 
              style={styles.tableContainer}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                <Row data={['Item Name', 'Enter text to edit']} style={styles.header} textStyle={styles.headerText}/>
                {tableData.map((row, index) => (
                  <Row 
                    key={index}
                    data={[
                      <Text style={styles.tableText}>{row.itemName}</Text>,
                      <TextInput
                        style={styles.input}
                        value={row.inputValue}
                        onChangeText={(text) => handleInputChange(index, text)}
                      />
                    ]}
                  />
                ))}
              </Table>
            </KeyboardAwareScrollView>
          )}
        </>
      )}
      
      

      {/* Display Table with Room Data */}
      {selectedOption === 'Room' && (
        
        <KeyboardAwareScrollView 
          enableOnAndroid={true} 
          extraHeight={150} 
          style={styles.tableContainer}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
            <Row data={['Room Name', 'Enter text to edit']} style={styles.header} textStyle={styles.headerText}/>
            {tableData.map((row, index) => (
              <Row 
                key={index}
                data={[
                  <Text style={styles.tableText}>{row.roomName}</Text>,
                  <TextInput
                    style={styles.input}
                    value={row.inputValue}
                    onChangeText={(text) => handleInputChange(index, text)}
                  />
                ]}
              />
            ))}
          </Table>
        </KeyboardAwareScrollView>
      )}
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    padding: 12,
    backgroundColor: '#61A7E8',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 8,  // Adjust the space between icons and text if needed
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#61A7E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    backgroundColor: '#61A7E8',
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  textLabel: {
    marginLeft: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  tableContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#fff'
    
  },
  header: { 
    height: 50, 
    backgroundColor: '#f1f8ff' 
  },
  headerText: { 
    margin: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: { 
    margin: 6,
    textAlign: 'center',
  },
  tableText: {
    margin: 6,
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    height: 40,
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#61A7E8',
    borderWidth: 0.4,
    borderRadius: 10,
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 2,
    marginTop: 2,
  },
  dropdown: {
    marginVertical: 10,
    marginHorizontal: 20,
    zIndex: 10,
    paddingLeft: 10,
    paddingRight: 10,
    width: '100%', // Set the width to match the container
    justifyContent: 'center', // Center content horizontally
    paddingHorizontal: 10, // Add padding to avoid touching edges
  },
  dropDownContainer: {
    width: '100%', // Adjust width to align with the dropdown box
    alignSelf: 'center', // Center the dropdown box in its container
    marginLeft: 20, // Ensure the dropdown values align under the dropdown box
  },
  dropdownContainer: {
    width: '90%', // Ensure the dropdown container spans the full width
    alignItems: 'center', // Align dropdown box in the center
    marginLeft: '5%',
    marginRight: '5%',
  },
  dropdownitemContainer: {
    width: '48.5%', // Ensure the dropdown container spans the full width
    alignItems: 'center', // Align dropdown box in the center

  },
  dropdownText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },

  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  dropdownHalf: {
    flex: 0.48,  // Adjusts the width to half the available space (48% of the row)
  },

  breakLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 8,
  },
  breakLine1: {
    marginVertical: 8,
    paddingBottom: 10,
    paddingTop: 10,
  },

});

export default EditNamePage;
