import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAllItemsByLocation, getRoomsFromDatabase, getLocationsFromDatabase, updateItemAlertQtyAndExpDate  } from '../database';
import { Row, Table, Rows } from 'react-native-table-component';
import { format } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BackHandler } from 'react-native';



const AlertPage = () => {
  const [tableData, setTableData] = useState([]);
  const navigation = useNavigation();
  const [inoutId, setInOutId] = useState(1);  // State to hold the ID number

  // Room dropdown state
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomValue, setRoomValue] = useState(null);
  const [rooms, setRooms] = useState([]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [locations, setLocations] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const formattedDate = format(new Date(), 'dd/MM/yyyy');
  const [itemId, setItemId] = useState(null);  // Add this line at the beginning of your component
  const [alertQuantities, setAlertQuantities] = useState({}); // Previously outgoingQuantities
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);



  const clearSelections = () => {
    setTableData([]);
    setRoomValue(null);
    setLocationValue(null);
    setAlertQuantities({});
    setTotalQuantity(0);
    // Any other states you want to reset
  };

  const handleAlertQuantityChange = (index, value) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const item = newData[index];
      const maxQty = parseInt(item.maxqty || '0', 10);
      const newQty = parseInt(value || '0', 10);

      if (newQty <= maxQty) {
        item.alertqty = newQty.toString(); 
      } else {
        Alert.alert('Invalid Quantity', `The alert quantity cannot exceed the available quantity of ${maxQty}.`);
      }

      const totalQty = calculateTotalQuantity(newData);
      setTotalQuantity(totalQty);

      return newData;
    });
  };

  const showDatePicker = (index) => {
    setSelectedDateIndex(index);
    setDatePickerVisibility(true);
  };


  const hideDatePicker = () => {
    setTableData(prevData => {
        if (selectedDateIndex !== null) {
            const newData = [...prevData];
            newData[selectedDateIndex].expdate = ''; // Clear the expiration date when the "Cancel" button is pressed
            return newData;
        }
        return prevData;
    });
    setSelectedDateIndex(null);  // Reset the selected date index
    setDatePickerVisibility(false); // Hide the date picker
  };



  const handleConfirm = (date) => {
    const formattedDate = format(date, 'dd/MM/yyyy');
    setTableData(prevData => {
      const newData = [...prevData];
      if (selectedDateIndex !== null && newData[selectedDateIndex]) {
        newData[selectedDateIndex].expdate = formattedDate; // Set the formatted date
      }
      return newData;
    });
    setSelectedDateIndex(null);  // Reset the selected date index
    setDatePickerVisibility(false); // Hide the date picker
  };




  const filterItemsWithAlertQty = (data) => {
    return data.filter(item => parseInt(item.alertqty || '0', 10) > 0);
  };


  const calculateTotalQuantity = (data) => {
    return data.reduce((total, item) => {
      return total + parseInt(item.alertqty || '0', 10);
    }, 0);
  };


  const handleIncrement = (index) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const item = newData[index];
      const currentQty = parseInt(item.alertqty || '0', 10);
      const maxQty = item.maxqty;

      if (currentQty < maxQty) {
        newData[index] = { ...item, alertqty: (currentQty + 1).toString() };
      }

      // Recalculate total quantity
      const totalQty = calculateTotalQuantity(newData);
      setTotalQuantity(totalQty);
      console.log(totalQty);

      return newData;
    });
  };

  const handleDecrement = (index) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const item = newData[index];
      const currentQty = parseInt(item.alertqty || '0', 10);

      if (currentQty > 0) {
        newData[index] = { ...item, alertqty: (currentQty - 1).toString() };
      }

      // Recalculate total quantity
      const totalQty = calculateTotalQuantity(newData);
      setTotalQuantity(totalQty);

      return newData;
    });
  };

  useEffect(() => {
    const total = calculateTotalQuantity(tableData);
    setTotalQuantity(total);
    console.log('useeffect', total);
  }, [tableData]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;  // Return true to prevent the default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
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
    if (locationValue) {
      const fetchItems = async () => {
        try {
          console.log("Selected Location ID:", locationValue);  // Log the selected location ID
          
          const items = await getAllItemsByLocation(locationValue); // Fetch items
          console.log("Fetched Items:", items);  // Log the fetched items
          
          const formattedData = items.map(item => ({
            itemname: item.itemname,  // Item Name
            itemqty: item.itemqty.toString(),  // Quantity
            alertqty: "",  // Outgoing Qty (leave blank)
            itemid: item.itemid,
            maxqty: item.itemqty,  // Maximum quantity
          }));
          
          setTableData(formattedData);  // Set the formatted data in the table
        } catch (error) {
          console.error("Error fetching items by location:", error);
        }
      };


      fetchItems();
    } else {
      setTableData([]);  // Clear the table if no location is selected
    }
  }, [locationValue]);

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

  // Fetch items when a location is selected
  useEffect(() => {
    if (locationValue) {
      const fetchItems = async () => {
        try {
          console.log("Selected Location ID:", locationValue);  
          const items = await getAllItemsByLocation(locationValue); 
          console.log("Fetched Items:", items);  
          
          const formattedData = items.map(item => ({
            itemname: item.itemname,  
            itemqty: item.itemqty.toString(),  
            alertqty: item.alertqty ? item.alertqty.toString() : '0',  // Set to '0' if null
            expdate: item.expdate || '',  // Set to empty string if null
            itemid: item.itemid,
            maxqty: item.itemqty,  
          }));
          
          setTableData(formattedData);  
        } catch (error) {
          console.error("Error fetching items by location:", error);
        }
      };
      fetchItems();
    } else {
      setTableData([]);  
    }
  }, [locationValue]);

  const handleExpDateChange = (index, value) => {
    setTableData(prevData => {
      const newData = [...prevData];
      newData[index].expdate = value;
      return newData;
    });
  };



  const handleSaveData = async () => {
    try {
      for (const item of tableData) {
        const alertQty = parseInt(item.alertqty, 10);
        const expDate = item.expdate;

        const alertQtyToSave = alertQty === 0 ? null : alertQty;
        const expDateToSave = expDate === '' ? null : expDate;

        await updateItemAlertQtyAndExpDate(item.itemid, alertQtyToSave, expDateToSave);
      }

      Alert.alert('Success', 'Data has been updated successfully.');
      navigation.navigate('Home'); 

    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('Error', 'There was an issue updating the data.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => { clearSelections(); navigation.navigate('Home'); }}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="bell" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Alert</Text>
        </View>
        <TouchableOpacity onPress={handleSaveData}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Room Section */}
      <View style={styles.titlerow}>
        
        <DropDownPicker
          open={roomOpen}
          value={roomValue}
          items={rooms}
          setOpen={setRoomOpen}
          setValue={setRoomValue}
          setItems={setRooms}
          style={styles.dropdown}
          placeholder="Select Room"
          containerStyle={{ width: '48%' }}
          textStyle={{ fontWeight: 'bold' }}
          
          placeholderStyle={{ fontWeight: 'bold' }}
          
        />
        
        <DropDownPicker
          open={locationOpen}
          value={locationValue}
          items={locations}
          setOpen={setLocationOpen}
          setValue={setLocationValue}
          setItems={setLocations}
          style={styles.dropdown}
          placeholder="Select Location"
          containerStyle={{ width: '48%' }}
    
          placeholderStyle={{ fontWeight: 'bold' }}
          textStyle={{ fontWeight: 'bold' }}
          
        />
      </View>
    
      <View style={styles.breakLine} />
      <View style={{ flex: 1 }}>  
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Table Section */}
          <View style={styles.tableContainer}>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#ccc' }}>
              <Row
                data={['Item Name', 'Qty', 'Alert Qty', 'Exp Date']}
                style={styles.tableHeader}
                textStyle={styles.tableHeaderText}
                flexArr={[1.2, 0.6, 1.1,1.1]}  // Width ratio 1.6:0.4:1
              />
              <Rows
                data={tableData.map((item, index) => [
                  item.itemname,
                  item.itemqty,
                  <View style={styles.cellContainer} key={index}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDecrement(index)}
                    >
                      <MaterialCommunityIcons name="minus" size={20} color="#000" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.cellalertInput}
                      keyboardType="numeric"
                      value={item.alertqty}  
                      onChangeText={(value) => handleAlertQuantityChange(index, value)} 
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleIncrement(index)}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>,  
                  
                  <TouchableOpacity onPress={() => showDatePicker(index)}>
                    <TextInput
                      style={styles.cellInput}
                      value={item.expdate}
                      placeholder="Enter Date"
                      editable={false}  // Disable manual editing
                    />
                  </TouchableOpacity>,
                ])}
                textStyle={styles.tableText}
                flexArr={[1.2, 0.6, 1.1, 1.1]}  
              />


            </Table>
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Alert Quantity: {totalQuantity}</Text>
      </View>

      {/* DateTimePickerModal component */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
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
  
  breakLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  titlerow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },

  dropdown: {
    padding: 10,
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
    color: '#fff',
  },
  tableContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tableHeader: {
    backgroundColor: '#f1f8ff',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableText: {
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
  },

  // Container for the table cell with buttons and text
  cellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
  },
  
  // Style for the increment and decrement buttons
  iconButton: {
    padding: 3,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Style for the text in the table cells
  cellInput: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    color: 'black',
    textAlign: 'center',
    minWidth: 30,  // Adjust this to fit your design
    borderBottomWidth: 1,  // Optional: adds a bottom border to the input
    borderColor: '#ccc',  // Optional: color of the bottom border
  },
  cellalertInput: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    minWidth: 25,  // Adjust this to fit your design
    borderBottomWidth: 1,  // Optional: adds a bottom border to the input
    borderColor: '#ccc',  // Optional: color of the bottom border
  },

  
});

export default AlertPage;
