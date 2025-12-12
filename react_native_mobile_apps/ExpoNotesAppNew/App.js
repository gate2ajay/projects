// App.js - Your complete code for the Notes App using Expo

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';

// Import the SQLite library from Expo
import * as SQLite from 'expo-sqlite';

// Open a connection to the database, or create it if it doesn't exist
const db = SQLite.openDatabase('notes.db');

const App = () => {
  // State variables to hold our data
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');

  // This function runs once when the app starts
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)`,
        [],
        () => {
          // After creating the table, load the notes
          loadNotes();
        },
        (_, error) => {
          console.log('Error creating table: ' + error);
          return false; // returning false rolls back the transaction
        }
      );
    });
  }, []);

  // Function to load all notes from the database
  const loadNotes = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM notes ORDER BY id DESC`,
        [],
        (_, { rows: { _array } }) => {
          setNotes(_array); // Update our state with the notes
        },
        (_, error) => {
          console.log('Error loading notes: ' + error);
          return false;
        }
      );
    });
  };

  // Function to save the current note to the database
  const saveNote = () => {
    if (!currentNote) {
      Alert.alert('Error', 'You cannot save an empty note.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO notes (content) VALUES (?)`,
        [currentNote],
        (_, { insertId }) => {
          console.log(`Note with ID ${insertId} added successfully`);
          loadNotes(); // Reload the notes to show the new one
          setCurrentNote(''); // Clear the input box
        },
        (_, error) => {
          console.log('Error adding note: ' + error);
          return false;
        }
      );
    });
  };

  // Function to render each item in our list
  const renderNote = ({ item }) => {
    return (
      <View style={styles.noteItem}>
        <Text style={styles.noteText}>{item.content}</Text>
      </View>
    );
  };

  // This is the UI of our app
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>My Local Notes (Expo)</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your note here..."
          value={currentNote}
          onChangeText={setCurrentNote}
        />
        <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No notes found. Add one!</Text>}
      />
    </SafeAreaView>
  );
};

// Styles for our components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteText: {
    fontSize: 18,
    color: '#444',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#999',
  },
});

export default App;

