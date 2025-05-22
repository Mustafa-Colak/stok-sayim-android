// styles/UrunEkleStyles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 15, backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15, borderRadius: 8, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  modeSwitch: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  modeBtn: {
    flex: 1, padding: 10, marginHorizontal: 5,
    backgroundColor: '#eee', borderRadius: 6, alignItems: 'center'
  },
  selected: { backgroundColor: '#007bff' },
  modeText: { color: '#000' },
});
