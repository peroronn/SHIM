import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ReportPage = ({ navigation }) => {
  
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <View style={styles.leftGroup}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="file-document" size={40} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.titleText}>Report</Text>
        </View>
      </View>
      
      
      
        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportRoom')}
        >
          <Text style={styles.reportText}>List of Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportLocation')}
        >
          <Text style={styles.reportText}>List of Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportItem')}
        >
          <Text style={styles.reportText}>List of Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportIncoming')}
        >
          <Text style={styles.reportText}>List of Incoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportOutgoing')}
        >
          <Text style={styles.reportText}>List of Outgoing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportItem}
          onPress={() => navigation.navigate('ReportAll')}
        >
          <Text style={styles.reportText}>List of All</Text>
        </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  reportItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  reportText: { 
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default ReportPage;
