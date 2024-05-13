import { ref }  from 'vue'

export type Image = {
  src: string;
  base64: string;
}

const input = ref('')
const images = ref<Image[]>([])

export const useInput = () => {

  const setInput = (value: string) => {
    input.value = value
  }

  const setImages = (value: Image[]) => {
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