// import { ref } from "vue";
// import { useRouter } from "vue-router";
// import { app } from "../boot/app";
// import useAIChat from "./useAIChat";
// import useCurrentConversation from "./useCurrentConversation";
// import Message from "src/utils/App/Message";
// import generateUUID from "./generateUUID";
// import { Notify } from "quasar";

// export const useChatInput = () => {
//   const router = useRouter()

//   const currentConversation = useCurrentConversation();
//   const { loading, getChatResponse } = useAIChat();
//   const input = ref('');

//   const generateResponse = async () => {
//     let conversation = currentConversation.value
//     if (!conversation) {
//       conversation = app.createConversation(input.value.slice(0, 20))
//       router.push(`/${conversation.id}`)
//     }

//     conversation.messages.push(new Message({
//       id: generateUUID(),
//       content: { raw: input.value },
//       author: 'user',
//     }))

//     const model = app.settings.value.selectedModel
//     if (!model) return

//     const messages = conversation.getChatHistory()

//     const message = new Message({
//       id: generateUUID(),
//       content: { raw: '' },
//       modelId: model.id,
//       author: 'assistant',
//     })
//     conversation.messages.push(message)

//     try {
//       const res = await getChatResponse(model, messages, (res) => {
//         message.content.value.raw = res.message.content
//       })
//       message.content.value.raw = res.message.content
//     } catch (err) {
//       console.error(err)
//       Notify.create({
//         message: 'Failed to send message, please try again later',
//         color: 'negative',
//         position: 'bottom',
//       })
//     }

//   }

//   return {
//     input,
//     loading,

//   }
// }