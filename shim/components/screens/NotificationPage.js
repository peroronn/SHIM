import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getNotificationItem, getcleartext, updatecleartext } from '../database';
import { Table, Row, Rows } from 'react-native-table-component';

const NotificationPage = ({ navigation }) => {
  const [tableData, setTableData] = useState([]);
  const [cleartext, setCleartext] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cleartextResult = await getcleartext();
        if (cleartextResult.length > 0) {
          setCleartext(cleartextResult[0].cleartext);
        }

        if (cleartextResult[0].cleartext === 1) {
          const notificationItems = await getNotificationItem();
          console.log(notificationItems);
          setTableData(notificationItems);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  if (cleartext !== 1) {
    return (
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <View style={styles.leftGroup}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="bell" size={40} color="#fff" style={styles.iconSpacing} />
            <Text style={styles.titleText}>Notification</Text>
          </View>
          <TouchableOpacity onPress={handleDeletePress}>
            <Icon name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View >
        <Text style={styles.notificationText}>No notifications to show.</Text>

      </View>
    );
  }

  const handleDeletePress = async () => {
    try {
      await updatecleartext(0);  // Update cleartext to 0
      setCleartext(0);  // Update state to hide the table
    } catch (error) {
      console.error("Failed to update cleartext:", error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="bell" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Notification</Text>
        </View>
        <TouchableOpacity onPress={handleDeletePress}>
          <Icon name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView >
        <View style={styles.itemcontainer}>

          <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
            <Row
              data={['Item Name', 'Qty', 'Alert Qty', 'Exp Date']}
              style={styles.header}
              textStyle={styles.headerText}
              flexArr={[1.4, 0.4, 0.4, 0.8]}
            />
            {tableData.map((item, index) => (
              <Row
                key={index}
                data={[item.displayName, item.itemqty, item.alertqty, item.expdate]}
                style={[styles.tableRow, index % 2 && styles.tableRowAlt]}
                textStyle={styles.tableText}
                flexArr={[1.4, 0.4, 0.4, 0.8]}
              />
            ))}
          </Table>
        </View>
      </ScrollView >
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
  header: {
    height: 50,
    backgroundColor: '#f1f8ff',
    
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  notificationText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
    marginTop: '70%',
    color: '#0088CC',
  },
  tableRow: {
    backgroundColor: '#f9f9f9',
  },
  tableRowAlt: {
    backgroundColor: '#f1f8ff',
  },
  tableText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  itemcontainer: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10,
  },
});

export default NotificationPage;
