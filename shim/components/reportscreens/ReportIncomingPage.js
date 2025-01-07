import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { getAllIn } from '../database'; // Ensure correct path to database file

const ReportIncomingPage = ({ navigation }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllIn();

        // Group data by inoutid, date, and totalqty
        const groupedData = data.reduce((acc, item) => {
          const key = `${item.inoutid}_${item.date}_${item.totalqty}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {});

        // Format data for the table
        const formattedData = Object.values(groupedData).flatMap(group => {
          return group.map((item, index) => [
            index === 0 ? item.inoutid : '',  // Show inoutid only for the first item in the group
            index === 0 ? item.date : '',     // Show date only for the first item in the group
            index === 0 ? item.totalqty : '', // Show totalqty only for the first item in the group
            item.itemname,
            item.itemqty
          ]);
        });

        setTableData(formattedData);
      } catch (error) {
        console.error("Failed to fetch incoming data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Report')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report Incoming</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer} contentContainerStyle={styles.contentContainer}>
        <Table borderStyle={styles.table}>
          <Row
            data={['ID', 'Date', 'Total Qty', 'Item Name', 'Qty']}
            style={styles.head}
            textStyle={styles.text}
            flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]} // Adjusted column widths
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            flexArr={[0.5, 1.5, 0.6, 1.6, 0.6]} // Match the widths to the header
          />
        </Table>
      </ScrollView>
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
    marginLeft: 8,  // Adjust the space between icons and text if needed
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 30, // Added bottom padding to ensure the last row is visible
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
});

export default ReportIncomingPage;
