import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CenterSection({ frameName, onFrameNameChange }) {
  const [editing, setEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(frameName);

  const handleSave = () => {
    if (tempName.trim()) {
      onFrameNameChange(tempName.trim());
    } else {
      setTempName(frameName);
    }
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      {editing ? (
        <TextInput
          style={styles.input}
          value={tempName}
          onChangeText={setTempName}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          autoFocus
          selectTextOnFocus
        />
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)} style={styles.nameContainer}>
          <Text style={styles.frameName}>{frameName}</Text>
          <Ionicons name="pencil" size={14} color="#888" style={styles.editIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  frameName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 6,
  },
  editIcon: {
    marginLeft: 4,
  },
  input: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 150,
    textAlign: 'center',
  },
});
