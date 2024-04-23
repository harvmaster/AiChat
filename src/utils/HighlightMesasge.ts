import { marked } from "marked";
import Prism from 'prismjs'

// take in a string

type Message = string

type HighlightedMessageResponse = {
  highlightedMessage: String
  codeBlocks: Array<String>
  origialMessage: String
}

type HighlightedChunks = {
  original: String
  output: String
  code: String
}[]

// remove lines and replace with a special character
const removeLines = (text: string) => {
  return text.replace(/\n/g, '∂')
}

const getCodeBlocks = (text: string) => {
  const noLines = removeLines(text)
  return text.match(/<code[^>]*>.*?<\/code>/g)?.map(joinLines)
}

const joinLines = (text: string) => {
  return text.replace(/∂/g, '\n')
}

const highlightCodeBlock = (codeBlock: string) => {
  
  // Get the language from the class
  let language = codeBlock.match(/<code class="language-(.*?)">/)?.[1] || 'javascript';
  if (Prism.languages[language] === undefined) language = 'javascript';
  
  // Remove the <code> tags from it
  const code = codeBlock
  .replace(/<code[^>]*>/, '')
  .replace(/<\/code>/, '');
  
  // parse the code from html to remove &lt and &gt from the code
  const domParser = new DOMParser();
  const parsedCode = domParser.parseFromString(code, 'text/html').body.textContent || '';
  
  // highlight the code
  const highlightedCode = Prism.highlight(parsedCode, Prism.languages[language], language);
  
  return `<code class="language-${language}">${highlightedCode}</code>`
}

const getHighlightedChunks = async (message: Message): HighlightedChunks => {
  const markup = await marked.parse(message)
  const codeBlocks = getCodeBlocks(markup)

  if (codeBlocks) {

  }


}

export default getHighlightedChunks