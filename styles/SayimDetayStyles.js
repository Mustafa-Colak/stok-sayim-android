import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 45, // Sabit yükseklik
  },
  text: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 20,
  },
  modeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  modeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
  },
  countText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
});