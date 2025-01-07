import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { getAllItem, getAllIn, getAllOut, getAllRoom, getAllLocation } from '../database'; // Import database functions

const ReportAllPage = ({ navigation }) => {
  const [itemData, setItemData] = useState([]);
  const [inData, setInData] = useState([]);
  const [outData, setOutData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Existing fetch calls for items, incoming, and outgoing data...
        const rooms = await getAllRoom();
        const formattedRoomData = rooms.map((room, index) => [`${index + 1}.`, room.roomname]);
        setRoomData(formattedRoomData);

        const locations = await getAllLocation();
        const formattedLocationData = locations.map((location, index) => {
          if (index > 0 && locations[index - 1].roomname === location.roomname) {
            return ['', location.locationname];
          }
          return [location.roomname, location.locationname];
        });
        setLocationData(formattedLocationData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for all tables
        const items = await getAllItem();
        const incoming = await getAllIn();
        const outgoing = await getAllOut();

        // Format data for Item Table
        const formattedItemData = items.map(item => [
          <View key={item.itemname}>
            <Text style={styles.itemName}>{item.itemname}</Text>
            <Text style={styles.itemDetails}>({item.roomname}, {item.locationname})</Text>
          </View>,
          item.itemqty.toString(),
          item.alertqty ? item.alertqty.toString() : 'N/A',
          item.expdate || 'N/A'
        ]);
        setItemData(formattedItemData);

        // Format data for Incoming Table
        const formattedInData = incoming.reduce((acc, item) => {
          const key = `${item.inoutid}_${item.date}_${item.totalqty}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});
        const formattedIn = Object.values(formattedInData).flatMap(group => {
          return group.map((item, index) => [
            index === 0 ? item.inoutid : '',
            index === 0 ? item.date : '',
            index === 0 ? item.totalqty : '',
            item.itemname,
            item.itemqty
          ]);
        });
        setInData(formattedIn);

        // Format data for Outgoing Table
        const formattedOutData = outgoing.reduce((acc, item) => {
          const key = `${item.inoutid}_${item.date}_${item.totalqty}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});
        const formattedOut = Object.values(formattedOutData).flatMap(group => {
          return group.map((item, index) => [
            index === 0 ? item.inoutid : '',
            index === 0 ? item.date : '',
            index === 0 ? item.totalqty : '',
            item.itemname,
            item.itemqty
          ]);
        });
        setOutData(formattedOut);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Report')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report All</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>

        {/* Room Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Room Report</Text>
          <Table borderStyle={styles.table}>
            <Row
              data={['No.', 'Room Name']}
              style={styles.head}
              textStyle={styles.text}
              flexArr={[0.4, 1.6]} 
            />
            <Rows
              data={roomData}
              textStyle={styles.text}
              flexArr={[0.4, 1.6]} 
            />
          </Table>
        </View>

        {/* Location Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Location Report</Text>
          <Table borderStyle={styles.table}>
            <Row
              data={['Room Name', 'Location Name']}
              style={styles.head}
              textStyle={styles.text}
              flexArr={[1, 1.7]} 
            />
            <Rows
              data={locationData}
              textStyle={styles.text}
              flexArr={[1, 1.7]} 
            />
          </Table>
        </View>
        {/* Item Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Item Report</Text>
          <Table borderStyle={styles.table}>
            <Row
              data={['Item Name', 'Qty', 'AlertQty', 'Exp Date']}
              style={styles.head}
              textStyle={styles.text}
              flexArr={[2, 0.5, 0.5, 1]}
            />
            <Rows
              data={itemData}
              textStyle={styles.text}
              flexArr={[2, 0.5, 0.5, 1]}
            />
          </Table>
        </View>

        {/* Incoming Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Incoming Report</Text>
          <Table borderStyle={styles.table}>
            <Row
              data={['ID', 'Date', 'Total Qty', 'Item Name', 'Qty']}
              style={styles.head}
              textStyle={styles.text}
              flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]}
            />
            <Rows
              data={inData}
              textStyle={styles.text}
              flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]}
            />
          </Table>
        </View>

        {/* Outgoing Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Outgoing Report</Text>
          <Table borderStyle={styles.table}>
            <Row
              data={['ID', 'Date', 'Total Qty', 'Item Name', 'Qty']}
              style={styles.head}
              textStyle={styles.text}
              flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]}
            />
            <Rows
              data={outData}
              textStyle={styles.text}
              flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]}
            />
          </Table>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContainer: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  tableSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  head: {
    height: 50,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  itemName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemDetails: {
    color: 'gray',
    textAlign: 'center',
  },
});

export default ReportAllPage;
