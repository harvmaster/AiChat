import { reactive } from "vue";

type Settings = {
  selectedProvider?: Provider;
}

class App {
  conversations: Conversation[] = reactive([]);

  settings: Settings = reactive({
    selectedProvider: undefined
  })
}