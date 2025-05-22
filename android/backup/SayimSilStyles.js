import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  warning: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#333' },
  buttons: {
    flexDirection: 'column',
    gap: 15,
  },
});
