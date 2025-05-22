import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    position: 'relative'
  },
  cardText: { fontSize: 18 },
  trash: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  itemRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  deletedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  durumText: {
    fontSize: 14,
    position: "absolute",
    right: 20,
    top: 18,
  },
  durumBaslamamis: {
    color: "#888",
  },
  durumDevam: {
    color: "#007bff",
    fontWeight: "500",
  },
  durumKapandi: {
    color: "#28a745",
    fontWeight: "500",
  },
  undoText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 64,
  },
});