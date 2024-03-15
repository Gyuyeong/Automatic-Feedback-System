'use client'

import Editor from '@monaco-editor/react';
import { useState, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import { useRouter, redirect } from 'next/navigation';

// button for copy and execute
const EditorButton = ({ text, updateCodeValue, editorRef }) => {
    const router = useRouter();

    const processCode = () => {
        const codeValue = editorRef.current.getValue();

        if (codeValue) {
          updateCodeValue(codeValue);
          if (text === "실행") {
            const encodedData = encodeURIComponent(codeValue);  // encode the data to send
            const url = `/?codeValue=${encodedData}`;
            console.log("execute!!");
            router.push(url);
            // redirect(url);
          } else {  // copy button
            console.log(codeValue);
            navigator.clipboard.writeText(codeValue);  // copy to clipboard
            alert("Copied to Clipboard");
          }
        }
    }

    return (
        <Button size="sm" colorScheme="messenger" onClick={processCode}>{text}</Button>
    )
}

function CodeEditor({ editorRef, codeValue }) {

    const onMount = (editor) => {
      editorRef.current = editor;
      editor.focus();
    }
  
    return (
      <>
        <Editor 
          flex="1" 
          theme='vs-dark'
          defaultLanguage="python" 
          value={codeValue} 
          onMount={onMount}
          options={{
            minimap: {enabled: false},
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto'
            }
          }}
        >
  
        </Editor>
      </>
    );
}

export default function RunSection() {
    const [codeValue, setCodeValue] = useState('');
    const editorRef = useRef(null);

    const updateCodeValue = (value) => {
        setCodeValue(value);
    }

    return (
        <>
          <div className='copy-and-save-section'>
            <EditorButton text={'Copy'} updateCodeValue={updateCodeValue} editorRef={editorRef}></EditorButton>
            <EditorButton text={'실행'} updateCodeValue={updateCodeValue} editorRef={editorRef}></EditorButton>
          </div>
          <CodeEditor editorRef={editorRef} codeValue={codeValue}></CodeEditor>
        </>
    )
}