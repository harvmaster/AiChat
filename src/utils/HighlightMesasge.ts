import { marked } from "marked";
import { parse } from "path";
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
  
  // Remove the <code> tags from it
  const code = codeBlock
  .replace(/<code[^>]*>/, '')
  .replace(/<\/code>/, '');
  
  // parse the code from html to remove &lt and &gt from the code
  const domParser = new DOMParser();
  const parsedCode = domParser.parseFromString(code, 'text/html').body.textContent || '';
  
  // highlight the code
  const highlightedCode = Prism.highlight(parsedCode, Prism.languages[language], language);
  
  return `<pre><code class="language-${language}">${highlightedCode}</code></pre>\n`
}

const splitOnce = (text: string, separator: string) => {
  const [first, ...rest] = text.split(separator)
  return [first, rest.length > 0 ? rest.join(separator) : '']
}

type Chunk = {
  input: string;
  output: string;
  type: 'code' | 'text';
}

const separateInputChunks = (text: string): Chunk[] => {
  const wrappedCodeBlocks = text.match(/(^(?:\n|^)```.{1,4}\n)([^]*?)(\n```)/gmi) || [];
  const chunks = wrappedCodeBlocks.reduce((acc, block) => {
    const [original, rest] = splitOnce(acc.input, block)
    acc.output.push({
      input: original,
      output: parseChunk(original),
      type: 'text'
    })
    acc.output.push({
      input: original,
      output: parseCodeChunk(block),
      type: 'code'
    })
    return {
      output: acc.output,
      input: rest
    }
  }, {
    output: [] as Chunk[],
    input: text
  })

  const output = chunks.output
  if (chunks.input.length > 0) output.push({ input: chunks.input, output: parseChunk(chunks.input), type: 'text' })
  
    return output
}

const getHighlightedChunks = async (message: Message) => {

  // Pull out code blocks
  const wrappedCodeBlocks = message.match(/(^(?:\n|^)```.{1,4}\n)([^]*?)(\n```)/gmi) || [];

  // Format code blocks
  const markedCodeBlocksPromises = wrappedCodeBlocks.map(async (block) => {
    const markedCode = await marked.parse(block)
    const codeBlocks = getCodeBlocks(markedCode) || []
    return {
      original: block,
      markedup: markedCode,
      output: highlightCodeBlock(codeBlocks.join(''))
    }
  });
  const markedCodeBlocks = await Promise.all(markedCodeBlocksPromises)

  // const otherBlocks = wrappedCodeBlocks.reduce((acc, block) => {
  //   return acc.map(chunk => {
  //     const chunks = splitOnce(chunk, block)
  //     return chunks
  //   }).flat()
  // }, [message])
  // console.log(otherBlocks)

  // const otherBlocks = wrappedCodeBlocks.reduce((acc, block) => {
  //   const [output, rest] = splitOnce(acc.input, block)
  //   acc.output.push(output)
  //   acc.output.push(block)
  //   return {
  //     output: acc.output,
  //     input: rest
  //   }
  // }, {
  //   output: [] as string[],
  //   input: message
  // })

  // const chunks = [ ...otherBlocks.output, otherBlocks.input ]
  // console.log(chunks)

  const chunks = separateInputChunks(message)
  console.log(chunks)

  // const hi

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