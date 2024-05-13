import MessageImage from 'src/utils/App/MessageImage';
import { ref }  from 'vue'


const input = ref('')
const images = ref<MessageImage[]>([])

export const useInput = () => {

  const setInput = (value: string) => {
    input.value = value
  }

  const setImages = (value: MessageImage[]) => {
    images.value = value
  }

  return {
    input,
    images,
    setInput,
    setImages
  }
}

export default useInput