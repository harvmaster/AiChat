import { reactive } from "vue";
import { Model } from '../services/models';

type Settings = {
  selectedModel?: Model;
}

class App {
  conversations: Conversation[] = reactive([]);

  settings: Settings = reactive({
    selectedModel: undefined
  })
}

const app = new App();

export default app;