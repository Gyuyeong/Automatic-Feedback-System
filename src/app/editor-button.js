'use client'

import { Button } from '@chakra-ui/react';

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


// button for executing code and generating ast
const EditorButton = ({ 
  text, 
  editorRef, 
  onExecute, 
  getExecutionTrace, 
  setNumImages, 
  setExecutedLineNumbers, 
  setLineAndImageMapping,
  executePressed, 
  setExecutePressed,
  setCompareText,
  activeEditor, 
  setActiveEditor, 
  setEditorContent, 
  checkedItem, 
  setIsLoading 
}) => {
  
  const processCode = async () => {
    if (activeEditor === 'editor') {  // editor
      let codeValue = editorRef.current.getValue();
  
      if (codeValue.length > 0) {
        
        // check if the first line is "from turtle import *"
        const firstLine = codeValue.trim().split('\r\n')[0];
        if (firstLine !== "from turtle import *") {
          alert("Your code must start with the following line:\nfrom turtle import *");
          return;
        }
        if (text === "실행") {
          // set execute pressed to true
          setExecutePressed(true);
          // hide execution trace
          setNumImages(0);  // set num Images to 0 (this erases the analysis)
          setExecutedLineNumbers([]);  // delete all executed line number trace
          setIsLoading(false);

          let codeLines = codeValue.trim().split('\r\n');
          // set the speed of the animation
          let speedCode;
          if (checkedItem === 'slow') {
            speedCode = "turtle.speed(1)";
          } else if (checkedItem === 'normal') {
            speedCode = "turtle.speed(4)"
          } else if (checkedItem === 'fast') {
            speedCode = "turtle.speed(0)"  // 0 is fastest
          }
          codeLines.splice(1, 0, 'import turtle', speedCode);  // add import turtle and speed code
          codeValue = codeLines.join('\r\n');
            
          // execute Python code with Skulpt
          Sk.configure({
            __future__: Sk.python3  // Python 3
          });
          let mypre = document.getElementById("output");
          mypre.innerHTML = "";
          Sk.pre = "output";
          Sk.configure({ output: outf, read: builtinRead });
          (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'turtle_canvas';
          let myPromise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, codeValue, true);
          });
          myPromise.then(async function (mod) {  // execute success
            // locate turtle canvas
            const turtleCanvasDiv = document.querySelector('#turtle_canvas');
            const canvas = turtleCanvasDiv.querySelector('canvas');
            let imageDataURL;
            try {
              imageDataURL = canvas.toDataURL('image/png');
            } catch (error) {
              imageDataURL = null; 
            }
            if (imageDataURL !== null && imageDataURL !== undefined) onExecute(codeValue, imageDataURL);  // save code to DB
          },
            function (err) {  // error in execution
              console.log(err.toString());
              alert("Error!!\nCheck Your Code");
            }
          );
        } else if (text == "분석") {
          try {
            setIsLoading(true);
            setExecutePressed(false);
            let resultData = await getExecutionTrace(codeValue);
            let executed_line_numbers = resultData['executed_line_numbers'];  // sequence of executed line numbers
            let line_number_and_image_mappings = resultData['line_number_and_image_mappings'];
            let numImages = resultData['num_images'];
            if (numImages > 0) setNumImages(numImages);
            else if (numImages == -1) {
              alert("Error!!\nCheck Your Code");
            }
            if (setExecutedLineNumbers !== null) setExecutedLineNumbers(executed_line_numbers);
            if (setLineAndImageMapping !== null) setLineAndImageMapping(line_number_and_image_mappings);
          } catch (error) {
            console.log("Error getting execution trace result:", error);
          }
        } else if (text === "비교") {
          setIsLoading(false);
          if (codeValue.length > 0) {
            setCompareText('Back');
            setEditorContent(editorRef.current.getValue());
            setActiveEditor('diff');
          }
        }
      }
    } else {  // diff editor
      if (text === "Back") {
        setIsLoading(false);
        setCompareText('비교');
        setActiveEditor('editor');
      }
    }
  }
  
  return (
    <Button 
      size="sm" 
      colorScheme="messenger" 
      onClick={processCode}
      isDisabled={(text === "분석") && (!executePressed)}  // analyze can only be pressed after execution of turtle
    >
      {text}
    </Button>
  )
}

export default EditorButton;