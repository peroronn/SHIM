import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getInOutHistory } from '../database';  // Adjust the import path accordingly
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const EditPage = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedTab, setSelectedTab] = useState('ALL');  // State to track selected tab
 
  useEffect(() => {
    fetchInOutHistory();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInOutHistory();
    }, [])
  );

  const fetchInOutHistory = async () => {
    try {
      const historyData = await getInOutHistory();
      setData(historyData);
    } catch (error) {
      console.error('Failed to fetch inout history:', error);
    }
  };

  // Function to filter data based on the selected tab
  const filterData = () => {
    if (selectedTab === 'IN') {
      return data.filter(item => item.inoutname === 'IN');
    } else if (selectedTab === 'OUT') {
      return data.filter(item => item.inoutname === 'OUT');
    }
    return data;  // Return all data for the 'ALL' tab
  };

  const filteredData = filterData();  // Apply filter based on selected tab

  return (
    <View style={styles.container}>
      {/* Header with Edit and back icon */}
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-edit" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Edit History</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === 'ALL' && styles.activeTab]}
          onPress={() => setSelectedTab('ALL')}
        >
          <Text style={styles.tabText}>ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === 'IN' && styles.activeTab]}
          onPress={() => setSelectedTab('IN')}
        >
          <Text style={styles.tabText}>IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === 'OUT' && styles.activeTab]}
          onPress={() => setSelectedTab('OUT')}
        >
          <Text style={styles.tabText}>OUT</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>

        {/* Data List */}
        {filteredData.map((item, index) => (
          <View key={index}>
            {/* Date Divider */}
            {index === 0 || filteredData[index - 1].date !== item.date ? (
              <View style={styles.dateDivider}>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            ) : null}
            {/* Item Row - Wrap with TouchableOpacity */}
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => navigation.navigate('EditHistoryData', {
                inoutid: item.inoutid,
                inoutname: item.inoutname,
                date: item.date,
                totalqty: item.totalqty
              })}
            >
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: item.inoutname === 'IN' ? '#A5D6A7' : '#EF9A9A' },
                ]}
              />
              <Text style={styles.itemText}>
                {item.inoutname} {item.inoutid}
              </Text>
              <Text style={styles.qtyText}>
                {item.totalqty} {/* Display total quantity on the right */}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  iconSpacing: {
    marginLeft: 8,  // Adjust the space between icons and text if needed
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#64B5F6',
    paddingVertical: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    color: '#fff',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  dateDivider: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dateText: {
    fontWeight: 'bold',
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusIndicator: {
    width: 5,
    height: 30,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
});

export default EditPage;
