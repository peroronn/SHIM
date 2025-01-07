import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect
import { getAllLocation } from '../database';

const ReportLocationPage = ({ navigation }) => {
  const [tableData, setTableData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLocations = async () => {
        try {
          const locations = await getAllLocation();

          // Format the data to show the room name only once and replace it with a comma in subsequent rows
          const formattedData = locations.map((location, index) => {
            if (index > 0 && locations[index - 1].roomname === location.roomname) {
              return ['', location.locationname]; // Empty room name for subsequent rows
            }
            return [location.roomname, location.locationname];
          });

          setTableData(formattedData);
        } catch (error) {
          console.error("Failed to fetch location data:", error);
        }
      };

      fetchLocations();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Report')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report Location</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer} contentContainerStyle={styles.contentContainer}>
        <Table borderStyle={styles.table}>
          <Row
            data={['Room Name', 'Location Name']}
            style={styles.head}
            textStyle={styles.text}
            flexArr={[1, 1.7]}  // Adjusted column widths (Room Name: 1, Location Name: 1.7)
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            flexArr={[1, 1.7]} // Match the widths to the header
          />
        </Table>
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
    height: 60,
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

export default ReportLocationPage;
