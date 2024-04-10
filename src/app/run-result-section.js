'use client'

import React from "react";
import Editor from '@monaco-editor/react';
import { useState, useRef } from 'react';
import { Button, SkipNavLink } from '@chakra-ui/react';
import { useRouter, redirect } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';


// function used in Skulpt
function outf(text) {
  var mypre = document.getElementById("output");
  mypre.innerHTML = mypre.innerHTML + text;
}

// function used in Skulpt
function builtinRead(x) {
  if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
    throw "File not found: '" + x + "'";
  }
  return Sk.builtinFiles["files"][x];
}


// button for copy and execute
const EditorButton = ({ text, editorRef, onExecute }) => {
  // const router = useRouter();

  const processCode = () => {
    const codeValue = editorRef.current.getValue();  // get code value from editor

    // function to extract png blob from canvas
    function extractImageFromCanvas(canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error("Failed to extract image from canvas."));
            return;
          }
          resolve(blob);
        }, 'image/png');
      });
    }

    if (codeValue.length > 0) {  // there must be something written there
      if (text === "실행") {
        // execute Python code with Skulpt
        Sk.configure({
          __future__: Sk.python3  // Python 3
        });
        var mypre = document.getElementById("output");
        mypre.innerHTML = "";
        Sk.pre = "output";
        Sk.configure({ output: outf, read: builtinRead });
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'turtle_canvas';
        var myPromise = Sk.misceval.asyncToPromise(function () {
          return Sk.importMainWithBody("<stdin>", false, codeValue, true);
        });
        myPromise.then(async function (mod) {  // execute success
          // locate turtle canvas
          const turtleCanvasDiv = document.querySelector('#turtle_canvas');
          const canvas = turtleCanvasDiv.querySelector('canvas');
          const imageDataURL = canvas.toDataURL('image/png');
          onExecute(codeValue, imageDataURL);  // save code to DB
        },
          function (err) {  // error in execution
            console.log(err.toString());
            alert("Error!!\nCheck Your Code");
          }
        );
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
          minimap: { enabled: false },
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

// Stores the results
const ResultAccordion = ({ title, pre_id, turtle_id }) => {
  return (
    <Accordion allowToggle bg="#111" border="none">
      <AccordionItem>
        <h2>
          <AccordionButton bg='#111' color='gray' _expanded={{ bg: '#111', color: 'white' }}>
            <Box as="span" flex='1' textAlign='left' fontSize="large" fontWeight="bold" ml="1px">
              {title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel bg="#fff" margin='10px'>
          <pre id={pre_id}>

          </pre>
          <div id={turtle_id}></div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default function RunResultSection({ value, onExecuteSuccess }) {
  const editorRef = useRef(null);
  return (
    <>
      <div className="run-section">
        <div className='copy-and-save-section'>
          <EditorButton text={'Copy'} editorRef={editorRef} onExecute={null}></EditorButton>
          <EditorButton text={'실행'} editorRef={editorRef} onExecute={onExecuteSuccess}></EditorButton>
        </div>
        <CodeEditor editorRef={editorRef} codeValue={value}></CodeEditor>
      </div>
      <div className="result-section">
        <div className='result-section'>
          <ResultAccordion title={"실행 결과"} pre_id="output" turtle_id="turtle_canvas"></ResultAccordion>
          <ResultAccordion title={"코드 구조 및 실행 순서"} pre_id="structure" turtle_id={null}></ResultAccordion>
        </div>
      </div>
    </>
  )
}