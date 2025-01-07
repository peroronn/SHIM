import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { getAllRoom } from '../database';


const ReportRoomPage = ({ navigation }) => {

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
  const fetchRooms = async () => {
    try {
      const rooms = await getAllRoom();
      const formattedData = rooms.map((room, index) => [`${index + 1}.`, room.roomname]);
      setTableData(formattedData);
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    }
  };

  fetchRooms();
}, []);


  return (
    <SafeAreaView  style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Report')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report Room</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer} contentContainerStyle={styles.contentContainer}>
        <Table borderStyle={styles.table}>
          <Row
            data={['No.', 'Room Name']}
            style={styles.head}
            textStyle={styles.text}
            flexArr={[0.4, 1.6]}  // Adjusted column widths (0.4: 80px, 1.6: 240px)
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            flexArr={[0.4, 1.6]} // Match the widths to the header
          />
        </Table>
      </ScrollView>
    </SafeAreaView >
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
    marginLeft: 8,  // Adjust the space between icons and text if needed
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingBottom: 30, // Added bottom padding to ensure the last row is visible
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 320, // Adjust the width to fit the screen properly
  },
});

export default ReportRoomPage;
