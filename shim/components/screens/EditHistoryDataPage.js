import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getItemDetailsByInOutId, updateItemQuantity, updateItemDetailQuantity, updateInOutTotalQuantity } from '../database'; // Adjust the import path accordingly

const EditHistoryDataPage = ({ route, navigation }) => {
  const { inoutid, inoutname, date, totalqty } = route.params;
  const [itemDetails, setItemDetails] = useState([]);
  const [originalQuantities, setOriginalQuantities] = useState([]); // To store original itd_itemqty values
  const [sumQuantities, setSumQuantities] = useState([]); // To store sum of itd_itemqty and i_itemqty
  const [currentInput, setCurrentInput] = useState([]);
  const [checkQuantities, setCheckQuantities] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  

  useEffect(() => {
    fetchItemDetails();
  }, []);

  const fetchItemDetails = async () => {
    try {
      const details = await getItemDetailsByInOutId(inoutid);

      // Store the original quantities, sum of quantities, and check quantities
      const originalQuantities = details.map(item => item.itd_itemqty);
      const sumQuantities = details.map(item => item.itd_itemqty + item.i_itemqty);
      const checkQuantities = details.map(item => Math.max(item.itd_itemqty - item.i_itemqty, 0));
      const initialInput = details.map(item => item.itd_itemqty.toString());


      setCurrentInput(initialInput);
      setOriginalQuantities(originalQuantities);
      setSumQuantities(sumQuantities);
      setCheckQuantities(checkQuantities);
      console.log(checkQuantities);
      setItemDetails(details);
      setTotalQuantity(totalqty);
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    }
  };

  const updateTotalQuantity = (details) => {
    const total = details.reduce((acc, item) => acc + item.itd_itemqty, 0);
    setTotalQuantity(total);
  };
  // Modify handleQuantityChange to enforce the limit for 'OUT' transactions
  const handleQuantityChange = (index, value) => {
    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue) || value === '') {
      // Allow the user to clear the input
      const updatedInput = [...currentInput];
      updatedInput[index] = value;
      setCurrentInput(updatedInput);
      return;
    }

    if (inoutname === 'IN') {
      // For IN transactions, enforce the checkQuantities threshold
      if (numericValue >= checkQuantities[index]) {
        const updatedInput = [...currentInput];
        updatedInput[index] = value;
        setCurrentInput(updatedInput);

        const updatedDetails = [...itemDetails];
        updatedDetails[index].itd_itemqty = numericValue;
        setItemDetails(updatedDetails);
      } else {
        alert(`Quantity cannot be less than ${checkQuantities[index]}`);
      }
    } else if (inoutname === 'OUT') {
      // For OUT transactions, enforce the sumQuantities limit
      if (numericValue <= sumQuantities[index]) {
        const updatedInput = [...currentInput];
        updatedInput[index] = value;
        setCurrentInput(updatedInput);

        const updatedDetails = [...itemDetails];
        updatedDetails[index].itd_itemqty = numericValue;
        setItemDetails(updatedDetails);
      } else {
        alert(`Quantity cannot exceed ${sumQuantities[index]}`);
      }
    }
    updateTotalQuantity(itemDetails); // Update total quantity on input change
  };


  // Modify handleIncrement to enforce the limit for 'OUT' transactions
  const handleIncrement = (index) => {
    const currentQuantity = parseInt(currentInput[index], 10) || 0;

    if (inoutname === 'IN') {
      // For IN transactions, allow any number within valid range
      if (currentQuantity + 1 >= checkQuantities[index]) {
        const updatedQuantity = currentQuantity + 1;

        // Update state
        const updatedInput = [...currentInput];
        updatedInput[index] = updatedQuantity.toString();
        setCurrentInput(updatedInput);

        const updatedDetails = [...itemDetails];
        updatedDetails[index].itd_itemqty = updatedQuantity;
        setItemDetails(updatedDetails);
      } else {
        alert(`Quantity cannot be less than ${checkQuantities[index]}`);
      }
    } else if (inoutname === 'OUT') {
      // For OUT transactions, enforce the sumQuantities limit
      if (currentQuantity + 1 <= sumQuantities[index]) {
        const updatedQuantity = currentQuantity + 1;

        // Update state
        const updatedInput = [...currentInput];
        updatedInput[index] = updatedQuantity.toString();
        setCurrentInput(updatedInput);

        const updatedDetails = [...itemDetails];
        updatedDetails[index].itd_itemqty = updatedQuantity;
        setItemDetails(updatedDetails);
      } else {
        alert(`Quantity cannot exceed ${sumQuantities[index]}`);
      }
    }
    updateTotalQuantity(itemDetails); // Update total quantity on increment
  };


  const handleDecrement = (index) => {
    const currentQuantity = parseInt(currentInput[index], 10) || 0;

    if (currentQuantity > 0) {  // Ensure quantity doesn't go below 0
      if (inoutname === 'IN') {
        // For IN transactions, allow any number
        if (currentQuantity - 1 >= checkQuantities[index]) {
          const updatedQuantity = currentQuantity - 1;

          // Update state
          const updatedInput = [...currentInput];
          updatedInput[index] = updatedQuantity.toString();
          setCurrentInput(updatedInput);

          const updatedDetails = [...itemDetails];
          updatedDetails[index].itd_itemqty = updatedQuantity;
          setItemDetails(updatedDetails);
        }
        else {
          alert(`Quantity cannot be less than ${checkQuantities[index]}`);
        }
      } else if (inoutname === 'OUT') {
        // For OUT transactions, enforce the limit
        if (currentQuantity - 1 <= sumQuantities[index]) {
          const updatedQuantity = currentQuantity - 1;

          // Update state
          const updatedInput = [...currentInput];
          updatedInput[index] = updatedQuantity.toString();
          setCurrentInput(updatedInput);

          const updatedDetails = [...itemDetails];
          updatedDetails[index].itd_itemqty = updatedQuantity;
          setItemDetails(updatedDetails);
        } else {
          alert(`Quantity cannot exceed ${sumQuantities[index]}`);
        }
      }
      updateTotalQuantity(itemDetails); // Update total quantity on decrement
    }
  };

  const handleSaveData = async () => {
    try {
      await updateInOutTotalQuantity(inoutid, totalQuantity);
      console.log("inout id is : ", inoutid, " total qty is : ", totalQuantity);
      
      for (let i = 0; i < itemDetails.length; i++) {
        console.log('Processing item index:', i);
        const item = itemDetails[i];
        const itemid = parseInt(item.itemid, 10); // Ensure itemid is a string
        const textInputQty = parseInt(currentInput[i], 10);
        const itemQty = parseInt(item.i_itemqty, 10); // Ensure itemQty is a number
        const itemDetailQty = parseInt(originalQuantities[i], 10); // Ensure itemDetailQty is a number
        console.log("itemDetailQty is : ", itemDetailQty); 
        console.log("textInputQty is : ", textInputQty); 
        console.log("itemQty is : ", itemQty); 
        console.log("itemid is : ", itemid); 
        
        console.log("item: ", item);
        console.log("break line "); 

        let newItemQty;

        if (inoutname === 'IN') {
          newItemQty = textInputQty + itemQty - itemDetailQty;
        } else if (inoutname === 'OUT') {
          newItemQty = itemDetailQty - textInputQty + itemQty;
          console.log("newItemqty OUT is : ", newItemQty); 
          
        }
        console.log("updateItemDetailQuantity to database - itemid: ", itemid, "textInputQty Qty: ", textInputQty, "inoutid : ", inoutid);
        console.log("updateItemQty to database- itemid: ", itemid, "newItem Qty: ", newItemQty);
        await updateItemDetailQuantity(inoutid, itemid, textInputQty);
        
        await updateItemQuantity(itemid, newItemQty);
      
        
  /*
       
        console.log("updateItemDetailQuantity function - itemid: ", itemid, "textInputQty Qty: ", textInputQty, "inoutid : ", inoutid);

*/
      }
      Alert.alert('Success', 'Data Edited successfully!');
      navigation.navigate('Edit');

      console.log('Data updated successfully');
    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('Error', 'Failed to edit data. Please try again.');
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons
            name="file-edit"
            size={40}
            color="#fff"
            style={styles.iconSpacing}
          />
          <Text style={styles.titleText}>Edit History - {inoutname}</Text>
        </View>
        <TouchableOpacity onPress={handleSaveData}>
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.datetitleBar}>
        <Text style={styles.dateText}>Date: {date}</Text>
        <Text style={styles.dateText}>ID: {inoutid}</Text>
      </View>
      <View style={styles.breakLine} />

      {/* Display each item detail */}
      <View style={{ flex: 1 }}>  
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
          {itemDetails.map((item, index) => (
            <View key={index} style={styles.itemDetailContainer}>
              <View>
                <Text style={styles.itemName}>{item.itemname}</Text>
                <Text style={styles.itemInfo}>
                  {item.roomname}, {item.locationname}
                </Text>
              </View>
              <View style={styles.cellContainer} key={index}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDecrement(index)}>
                  <MaterialCommunityIcons name="minus" size={24} color="#000" />
                </TouchableOpacity>
                <TextInput
                  style={styles.cellInput}
                  keyboardType="numeric"
                  value={currentInput[index] || ''}
                  onChangeText={(value) => handleQuantityChange(index, value)}
                />


                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleIncrement(index)}>
                  <MaterialCommunityIcons name="plus" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    backgroundColor: 'white',
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
    borderBottomColor: '#979797',
    marginVertical: 6,
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
  itemDetailContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemInfo: {
    color: 'gray',
  },
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

  cellInput: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    textAlign: 'center',
    minWidth: 30, // Adjust this to fit your design
    borderBottomWidth: 1, // Optional: adds a bottom border to the input
    borderColor: '#ccc', // Optional: color of the bottom border
  },
});

export default EditHistoryDataPage;
