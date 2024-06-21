export default function isInCodeblock(input: string, event?: KeyboardEvent): boolean {
  try {
    // Is in code block
    const target = event?.target as HTMLTextAreaElement;
    const cursorPosition = target?.selectionStart || input.length;
    const codeWrapperStarts = input.match(/^(?:\n|^)```..*?/gim) || [];
    const wholeCode =
      input.slice(0, cursorPosition).match(/(^(?:\n|^)```..*?\n)([^]*?)(\n```)/gim) || [];

    if (codeWrapperStarts.length != wholeCode.length) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
