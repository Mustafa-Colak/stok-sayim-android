import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f9fc",
  },
  baslik: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  kart: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  kartBaslik: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginLeft: 16,
  },
  kartAciklama: {
    fontSize: 14,
    color: "#666",
    marginLeft: 16,
    marginTop: 4,
  },
});