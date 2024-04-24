import { marked } from "marked";
import Prism from 'prismjs'

// take in a string

type Message = string

type HighlightedMessageResponse = {
  highlightedMessage: string
  codeBlocks: Array<string>
  origialMessage: string
}

type HighlightedChunks = {
  original: string
  output: string
  code: string
}[]

// remove lines and replace with a special character
const removeLines = (text: string) => {
  return text.replace(/\n/g, '∂')
}

const getCodeBlocks = (text: string) => {
  const noLines = removeLines(text)
  return noLines.match(/<code[^>]*>.*?<\/code>/g)?.map(joinLines)
}

const joinLines = (text: string) => {
  return text.replace(/∂/g, '\n')
}

const highlightCodeBlock = (codeBlock: string) => {
  console.log(Prism.languages)
  
  // Get the language from the class
  let language = codeBlock.match(/<code class="language-(.*?)">/)?.[1] || 'javascript';
  if (Prism.languages[language] === undefined) language = 'javascript';
  console.log(language)
  
  // Remove the <code> tags from it
  const code = codeBlock
  .replace(/<code[^>]*>/, '')
  .replace(/<\/code>/, '');
  
  // parse the code from html to remove &lt and &gt from the code
  const domParser = new DOMParser();
  const parsedCode = domParser.parseFromString(code, 'text/html').body.textContent || '';
  
  // highlight the code
  console.log(parsedCode)
  // const highlightedCode = Prism.highlight(parsedCode, Prism.languages.typescript, language);
  const highlightedCode = Prism.highlight(parsedCode, Prism.languages[language], language);
  
  return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`
}

const getHighlightedChunks = async (message: Message) => {

  // Pull out code blocks
  const wrappedCodeBlocks = message.match(/(^(?:\n|^)```.{1,4}\n)([^]*?)(\n```)/gmi) || [];

  // Format code blocks
  const markedCodeBlocksPromises = wrappedCodeBlocks.map(async (block) => {
    const markedCode = await marked.parse(block)
    const codeBlocks = getCodeBlocks(markedCode) || []
    console.log(codeBlocks)
    return {
      original: block,
      markedup: markedCode,
      output: highlightCodeBlock(codeBlocks.join(''))
    }
  });
  const markedCodeBlocks = await Promise.all(markedCodeBlocksPromises)

  // Format the rest of the markdown
  let markup = await marked.parse(message)

  // Replace markdown code blocks with highlighted code
  markedCodeBlocks.forEach((block) => {
    markup = markup.replace(block.markedup, block.output)
  })

  console.log(markup)
  return markup
}

export default getHighlightedChunks

/*
```ts
const getData = () => {
  return '' as string
}
```
*/