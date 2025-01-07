import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getRoomsFromDatabase, addLocationToDatabase } from '../database';
import {Row,Table,Rows} from 'react-native-table-component';
import { useFocusEffect } from '@react-navigation/native';

const NewLocationPage = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomValue, setRoomValue] = useState(null);
  const [roomIdMap, setRoomIdMap] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      // This function will be called when the screen is focused.
      return () => {
        // This function will be called when the screen is unfocused.
        // Clear the table data here
        setTableData([]);
      };
    }, [])
  );


  useEffect(() => {
    const fetchRooms = async () => {
      const fetchedRooms = await getRoomsFromDatabase();
      const roomItems = fetchedRooms.map((room) => {
        return {
          label: room.roomname,
          value: `${room.roomid}-${room.roomname}`, // Combine roomid and roomname as the value
        };
      });

      setRooms(roomItems);
    };

    fetchRooms();
  }, []);


  const handleAddToTable = () => {
    if (roomValue && locationName) {
      const [roomId, roomName] = roomValue.split('-'); // Split the combined value to get roomId and roomName
      const newEntry = [roomName, locationName];
      setTableData([...tableData, newEntry]);
      setRoomName('');
      setLocationName('');
    }
  };


  const handleSaveLocations = async () => {
    try {
      for (let entry of tableData) {
        const [roomName, location] = entry;
        const roomId = rooms.find(room => room.label === roomName).value.split('-')[0];
        console.log(`Saving location: ${location} in room: ${roomName}`);
        await addLocationToDatabase(roomId, location);
        console.log(`Saved location: ${location} in room: ${roomName}`);
      }

      // Clear the table data and reset inputs
      setTableData([]);
      setRoomName('');
      setLocationName('');
      setRoomValue(null);

      // Show success alert and navigate back
      Alert.alert("Success", "Location saved successfully.");
      navigation.navigate('In');

    } catch (error) {
      console.error('Error saving locations:', error);
    }
  };

  const renderRoomItem = (props) => {
    return (
      <View>
        <DropDownPicker.defaultListItem {...props} />
        <View style={styles.separator} />
      </View>
    );
  };




  const handleCancel = () => {
    setRoomName('');
    setLocationName('');
    setRoomValue('');
    
  };

  return (
      <SafeAreaView style={styles.container}>
        {/* Title Bar */}
        <View style={styles.titleBar}>
          <View style={styles.leftGroup}>
            <TouchableOpacity onPress={() => navigation.navigate('In')}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.titleText}>Add New Location</Text>
          </View>
          <TouchableOpacity onPress={handleSaveLocations}>
            <Icon name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.roomcontainer}>
          <View style={styles.itemcontainer}>
            <Text style={styles.titleLabel}>Add New Location</Text>
            <View style={styles.breakLine} />

            {/* Room Name Dropdown */}
            <View style={styles.inputroomRow}>
              <Text style={styles.inputLabel}>Room Name</Text>
              <DropDownPicker
                autoScroll
                autoScrollToValue={true} 
                open={roomOpen}
                value={roomValue}
                items={rooms}
                setOpen={setRoomOpen}
                setValue={setRoomValue}
                onChangeValue={setSelectedRoom}
                placeholder="Select Room"
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                
                
              />

            </View>
            <View style={styles.breakLine} />

            {/* Location Name Input */}
            <View style={styles.inputRow}>
              <Text style={styles.inputlocationLabel}>Location Name:</Text>
              <TextInput
                style={styles.textInput}
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>
            <View style={styles.breakLine} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToTable}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.breakLine} />

          {/* Table of Room and Location Names */}
          
          <ScrollView contentContainerStyle={{ marginBottom: 60 }}>
              <View style={styles.tableContainer}>
                <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
                <Row
                  data={['Room Name', 'Location Name']}
                  style={styles.tableHeader}
                  textStyle={styles.tableHeaderText}
                />
                <Rows data={tableData} textStyle={styles.tableCellText} />
              </Table>
            </View>
          </ScrollView>
          
        </View>
        
      </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  itemcontainer: {
    borderWidth: 1,
    paddingTop: 10,
    borderRadius: 10,
    zIndex: 1, // Ensure it appears above other elements
  },
  roomcontainer: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
    marginTop: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    padding: 16,
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
  titleLabel: {
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
  },
  inputLabel: {
    fontSize: 16,
    paddingRight: 10,
    paddingLeft: 10,
    flex: 0.47,
  },
  inputlocationLabel: {
    flex: 1,
    fontSize: 16,
    paddingRight: 10,
    paddingLeft: 10,
  },
  textInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingTop: 8,
    paddingLeft: 5,
    paddingBottom: 8,
    fontSize: 16,
    marginRight: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#61A7E8',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  breakLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    
  },
  dropdownContainer: {
    flex: 1,
    width: '100%'
  },
  tableContainer: {
    marginTop: 20,
  },
  tableHeader: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  tableHeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableCellText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputroomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
});

export default NewLocationPage;
