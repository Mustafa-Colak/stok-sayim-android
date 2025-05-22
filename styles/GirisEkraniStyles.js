import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18 
  },
  langSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  langBtn: { 
    fontSize: 16, 
    color: "#007bff", 
    marginHorizontal: 10 
  },
  selected: { 
    fontWeight: "bold", 
    textDecorationLine: "underline" 
  },
});