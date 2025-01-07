import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, BackHandler  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import { useFocusEffect } from '@react-navigation/native'; //
import { getAllItem } from '../database';

const ReportItemPage = ({ navigation }) => {
  const [tableData, setTableData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchItems = async () => {
        try {
          const items = await getAllItem();
          console.log("Fetched items:", items); // Debug line to check the fetched data

          const formattedData = items.map(item => [
            <View key={item.itemname}>
              <Text style={styles.itemName}>{item.itemname}</Text>
              <Text style={styles.itemDetails}>({item.roomname}, {item.locationname})</Text>
            </View>,
            item.itemqty.toString(),
            item.alertqty ? item.alertqty.toString() : 'N/A',
            item.expdate || 'N/A'
          ]);

          setTableData(formattedData);
        } catch (error) {
          console.error("Failed to fetch item data:", error);
        }
      };

      fetchItems();
      const onBackPress = () => {
          navigation.navigate('Report');
          return true; // Prevent default behavior
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

        // Cleanup listener on unmount
        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Report')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report Item</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer} contentContainerStyle={styles.contentContainer}>
        <Table borderStyle={styles.table}>
          <Row
            data={['Item Name', 'Qty', 'AlertQty', 'Exp Date']}
            style={styles.head}
            textStyle={styles.text}
            flexArr={[2, 0.5, 0.5, 1]}
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            flexArr={[2, 0.5, 0.5, 1]}
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
    marginLeft: 8,
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
    paddingBottom: 30,
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
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
    fontWeight: 'bold',
    
  },
});

export default ReportItemPage;
