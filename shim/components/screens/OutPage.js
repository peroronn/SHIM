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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getItemsByLocation, getRoomsFromDatabase, getLocationsFromDatabase, getInOutCount, getNextItemId, insertInOut, insertItemDetail, updateItemQuantity } from '../database';
import {
  Row,
  Table,
  Rows,
} from 'react-native-table-component';
import { format } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BackHandler } from 'react-native';



const OutPage = () => {
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
  const [outgoingQuantities, setOutgoingQuantities] = useState({}); // Track outgoing quantities by item ID

  const clearSelections = () => {
    setTableData([]);
    setRoomValue(null);
    setLocationValue(null);
    setOutgoingQuantities({});
    setTotalQuantity(0);
    // Any other states you want to reset
  };

  

  const handleQuantityChange = (index, value) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const item = newData[index];
      const maxQty = parseInt(item.maxqty || '0', 10);
      const newQty = parseInt(value || '0', 10);

      // Validate that the new quantity doesn't exceed the available quantity
      if (newQty <= maxQty) {
        item.outgoingqty = newQty.toString();
      } else {
        console.log(maxQty, "and newqty is ", newQty)
        Alert.alert('Invalid Quantity', `The outgoing quantity cannot exceed the available quantity of ${maxQty}.`);
      }

      // Recalculate total quantity
      const totalQty = calculateTotalQuantity(newData);
      setTotalQuantity(totalQty);

      return newData;
    });
  };

  const filterItemsWithOutgoingQty = (data) => {
    return data.filter(item => parseInt(item.outgoingqty || '0', 10) > 0);
  };


  const calculateTotalQuantity = (data) => {
    return data.reduce((total, item) => {
      return total + parseInt(item.outgoingqty || '0', 10);
    }, 0);
  };


  const handleIncrement = (index) => {
    setTableData(prevData => {
      const newData = [...prevData];
      const item = newData[index];
      const currentQty = parseInt(item.outgoingqty || '0', 10);
      const maxQty = item.maxqty;

      if (currentQty < maxQty) {
        newData[index] = { ...item, outgoingqty: (currentQty + 1).toString() };
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
      const currentQty = parseInt(item.outgoingqty || '0', 10);

      if (currentQty > 0) {
        newData[index] = { ...item, outgoingqty: (currentQty - 1).toString() };
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
          
          const items = await getItemsByLocation(locationValue); // Fetch items
          console.log("Fetched Items:", items);  // Log the fetched items
          
          const formattedData = items.map(item => ({
            itemname: item.itemname,  // Item Name
            itemqty: item.itemqty.toString(),  // Quantity
            outgoingqty: "",  // Outgoing Qty (leave blank)
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



  useEffect(() => {
    const fetchInOutCount = async () => {
      try {
        const count = await getInOutCount();
        const countitem = await getNextItemId();
        setInOutId(count + 1);
        setItemId(countitem +1);
        console.log("InOut Count:", count);
      } catch (error) {
        console.error("Error fetching inout count:", error);
      }
    };

    fetchInOutCount();
  }, []);


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
        const items = await getItemsByLocation(locationValue); // Assuming this function fetches item data based on location
        const formattedData = items.map(item => [
          item.itemname,  // Item Name
          item.quantity.toString(),  // Qty
          "",  // Outgoing Qty (to be filled later)
          item.itemitemid
        ]);
        setTableData(formattedData);
      };

      fetchItems();
    } else {
      setTableData([]);
    }
  }, [locationValue]);

  const handleSaveData = async () => {
    try {
      // Filter the items that have outgoingqty > 0
      const itemsToSave = filterItemsWithOutgoingQty(tableData);

      if (itemsToSave.length === 0) {
        Alert.alert('No items to save', 'Please select at least one item with outgoing quantity.');
        return;
      }

      // Insert data into the inout table
      await insertInOut(inoutId, "OUT", formattedDate, totalQuantity);

      // Loop through the items and insert into itemdetail and update item tables
      for (const item of itemsToSave) {
        const { itemid, outgoingqty } = item;

        // Insert into itemdetail table
        await insertItemDetail(inoutId, itemid, outgoingqty);

        // Calculate the new quantity and update the item table
        const newQty = item.itemqty - outgoingqty;
        await updateItemQuantity(itemid, newQty);
      }

      Alert.alert('Success', 'Data saved successfully!');
      clearSelections(); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'Out' }],
      });
     // navigation.navigate('Out', {}, { animationEnabled: false });

    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
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
          <MaterialCommunityIcons name="package-up" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Out</Text>
        </View>
        <TouchableOpacity onPress={handleSaveData}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      
      <View style={styles.datetitleBar}>
        <Text style={styles.dateText}>Date: {formattedDate}</Text>
        <Text style={styles.dateText}>ID: {inoutId}</Text>
      </View>
      <View style={styles.breakLine} />

      {/* Room Section */}
      <View style={styles.row}>
        
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
                data={['Item Name', 'Qty', 'Outgoing Qty']}
                style={styles.tableHeader}
                textStyle={styles.tableHeaderText}
                flexArr={[1.4, 0.4, 1.2]}  // Width ratio 1.6:0.4:1
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
                      <MaterialCommunityIcons name="minus" size={24} color="#000" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.cellInput}
                      keyboardType="numeric"
                      value={item.outgoingqty || '0'}
                      onChangeText={(value) => handleQuantityChange(index, value)}
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleIncrement(index)}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>,  
                ])}
                textStyle={styles.tableText}
                flexArr={[1.4, 0.4, 1.2]}
              />
            </Table>
          </View>
        </ScrollView>
      </View>
      
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
    padding: 8,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Style for the text in the table cells
  cellInput: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    textAlign: 'center',
    minWidth: 30,  // Adjust this to fit your design
    borderBottomWidth: 1,  // Optional: adds a bottom border to the input
    borderColor: '#ccc',  // Optional: color of the bottom border
  },

  
});

export default OutPage;
