import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const STORAGE_WORK_KEY = "@work";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [eidtText, setEidtText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadToDos();
    loadWork();
  }, []);

  // tab
  const loadWork = async () => {
    const value = await AsyncStorage.getItem(STORAGE_WORK_KEY);
    setWorking(value === "work" ? true : false);
  };

  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(STORAGE_WORK_KEY, "travel");
  };

  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(STORAGE_WORK_KEY, "work");
  };

  // toDo
  const onChangeText = (payload) => {
    setText(payload);
  };

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(value));
  };

  const addToDo = async () => {
    if (text === "") return;

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false, edit: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const onChangeEditText = (payload) => {
    setEidtText(payload);
  };

  // 클릭
  const editToggle = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].edit = !newToDos[key].edit;
    setToDos(newToDos);
    await saveToDos(newToDos);

    if (newToDos[key].edit) {
      setEidtText(newToDos[key].text);
    }
  };

  // 수정
  const editToDo = async (key, text) => {
    if (text === "") return;

    const newToDos = { ...toDos };
    newToDos[key].text = text;
    newToDos[key].edit = false;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("이 To Do를 삭제하실 건가요?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To DO?", "정말로요?", [
        { text: "아니오" },
        {
          text: "예",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const completedToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={
            working ? "할 일을 추가해주세요." : "어디에 가고 싶습니까?"
          }
          style={styles.input}
        />
      </View>

      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {toDos[key].edit ? (
                <>
                  <TextInput
                    defaultValue={toDos[key].text}
                    style={styles.toDoEditText}
                    onSubmitEditing={() => editToDo(key, eidtText)}
                    onChangeText={onChangeEditText}
                    value={eidtText}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => editToggle(key)}>
                    <MaterialIcons name="edit" size={20} color={theme.grey} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.toDoWLeftrap}>
                    <TouchableOpacity onPress={() => completedToDo(key)}>
                      {toDos[key].completed ? (
                        <MaterialIcons
                          name="check-box"
                          size={24}
                          color="white"
                        />
                      ) : (
                        <MaterialIcons
                          name="check-box-outline-blank"
                          size={24}
                          color="white"
                        />
                      )}
                    </TouchableOpacity>

                    <Text
                      style={{
                        ...styles.toDoText,
                        textDecorationLine: toDos[key].completed
                          ? "line-through"
                          : "none",
                        color: toDos[key].completed ? theme.grey : "white",
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  </View>

                  <View style={styles.toDoRightWrap}>
                    <TouchableOpacity onPress={() => editToggle(key)}>
                      <MaterialIcons name="edit" size={20} color={theme.grey} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toDoWLeftrap: {
    flexDirection: "row",
    columnGap: 12,
  },
  toDoRightWrap: {
    flexDirection: "row",
    columnGap: 8,
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: 500,
  },
  toDoEditText: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 8,
    borderRadius: 20,
  },
});
