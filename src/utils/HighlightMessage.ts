import { marked } from 'marked';
import Prism from 'prismjs'

type Message = string

export type Chunk = {
  raw: string;
  output: HighlightedChunk;
  type: 'code' | 'text';
}

export type HighlightedChunk = {
  markup: string;
  highlighted?: string;
}

export type HighlightedMessage = {
  raw: string;
  markup: string;
  chunks: Chunk[];
}

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

const parseCodeChunk = async (chunk: string): Promise<HighlightedChunk> => {
  const markedCode = await marked.parse(chunk)
  const codeBlocks = getCodeBlocks(markedCode) || []
  return {
    markup: markedCode,
    highlighted: highlightCodeBlock(codeBlocks.join(''))
  }
}

const parseTextChunk = async (chunk: string): Promise<HighlightedChunk> => {
  const markup = await marked.parse(chunk)
  return {
    markup: markup.replaceAll('\n', '<br>')
  }
}

const separateInputChunks = async (text: string): Promise<Chunk[]> => {
  const wrappedCodeBlocks = text.match(/(^(?:\n|^)```.*?\n)([^]*?)(\n```)/gmi) || [];

  let input = text
  const chunks: Chunk[] = []

  for (const codeBlock of wrappedCodeBlocks) {
    const [original, rest] = splitOnce(input, codeBlock)
    if (original) chunks.push({ raw: original, output: await parseTextChunk(original), type: 'text' })
    chunks.push({ raw: codeBlock, output: await parseCodeChunk(codeBlock), type: 'code' })
    input = rest
  }

  if (input.length > 0) chunks.push({ raw: input, output: await parseTextChunk(input), type: 'text' })

  return chunks
}

const getHighlightedChunks = async (message: Message): Promise<HighlightedMessage> => {
  const chunks = await separateInputChunks(message)

  let output = chunks.map((chunk, i) => {
    if (chunk.type === 'code') {
      if (i === chunks.length - 1) return chunk.output.highlighted || ''
      return (chunk.output.highlighted || '') + '<br>'
    } else {
      return chunk.output.markup
    }
  }).join('')

  if (output.endsWith('<br>')) output = output.slice(0, -4)

  return {
    raw: message,
    markup: output,
    chunks: chunks
  }
}

export default getHighlightedChunks

/*
```ts
const getData = () => {
  return '' as string
}
```
*/

/*
This is a test
[link](https://example.com)

```ts
const getHighlightedChunks = async (message: Message): Promise<HighlightedMessageChunks> => {
  const chunks = await separateInputChunks(message)

  const output = chunks.map((chunk) => {
    if (chunk.type === 'code') {
      return chunk.output.highlighted || ''
    } else {
      return chunk.output.markup
    }
  }).join('')

  return {
    input: message,
    markup: output,
    chunks: chunks
  }
}
```

This is a second test
```ts

export default getHighlightedChunks
```
*/