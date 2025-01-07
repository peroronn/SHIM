import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addRoomToDatabase } from '../database';
import { Table, Row, Rows } from 'react-native-table-component';

const NewRoomPage = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState([]);

  const handleAddRoom = () => {
    if (roomName.trim()) {
      setRooms([...rooms, { id: rooms.length + 1, name: roomName }]);
      setRoomName('');
    }
  };

  const handleSaveRooms = async () => {
    try {
      for (let room of rooms) {
        await addRoomToDatabase(room.name);  // Insert each room into the database
      }
      setRooms([]);  // Clear the rooms list
      Alert.alert("Success", "Room saved successfully.");
      navigation.navigate('In');  // Navigate back to the 'In' page after saving
      setRoomName('');
      
    } catch (error) {
      console.error("Error saving rooms:", error);
    }
  };

  const handleCancel = () => {
    setRoomName('');
  };

  // Prepare table data
  const tableData = rooms.map((room, index) => [index + 1, room.name]);

  return (
      <SafeAreaView style={styles.container}>
        
        {/* Title Bar */}
        <View style={styles.titleBar}>
          <View style={styles.leftGroup}>
            <TouchableOpacity onPress={() => navigation.navigate('In')}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.titleText}>Add New Room</Text>
          </View>
          <TouchableOpacity onPress={handleSaveRooms}>
            <Icon name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.roomcontainer}>
          <View style={styles.itemcontainer}>
            <Text style={styles.titleLabel}>Add New Room</Text>
            <View style={styles.breakLine} />
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Room Name:</Text>
              <TextInput
                style={styles.textInput}
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>
            
            <View style={styles.breakLine} />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Room List Table */}
          
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.tableContainer}>
              <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
                <Row
                  data={['No.', 'Room Name']}
                  style={styles.tableHeader}
                  textStyle={styles.tableHeaderText}
                />
                <Rows
                  data={tableData}
                  textStyle={styles.tableCellText}
                />
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
    borderColor: '#61A7E8',
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
    borderRadius: 5,
    marginRight: 10,
    marginLeft: 10,
    zIndex: 1000,  // Ensures the dropdown stays on top of other elements
  },
  dropdownContainer: {
    marginTop: 10,
    borderColor: '#ccc',
    borderRadius: 5,
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
    marginBottom: 16,
  },
});

export default NewRoomPage;