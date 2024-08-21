'use client'

import React, { useEffect } from "react";
import CodeEditor from "./code-editor";
import { useState, useRef } from 'react';
import { Button } from '@chakra-ui/react';
import { Box } from "@chakra-ui/react";
import { Flex, Spacer } from '@chakra-ui/react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { Text } from "@chakra-ui/react";

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

// utility buttons
// copy undo save
const UtilityButton = ({ editorRef, text, url }) => {
  const processCode = async () => {
    const codeValue = editorRef.current.getValue();

    if (codeValue.length > 0) {
      if (text === 'Copy') {
        navigator.clipboard.writeText(codeValue);  // copy to clipboard
        alert("Copied to Clipboard");
      }
    }
  };

  const buttonStyle = {
    backgroundImage: `url(/${url})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'inherit',
  };

  return <Button size='sm' 
    className='copy-button' 
    onClick={processCode} 
    style={buttonStyle}>
  </Button>
}


// button for executing code and generating ast
const EditorButton = ({ text, editorRef, onExecute, 
  getExecutionTrace, setNumImages, setExecutedLineNumbers, 
  setLineAndImageMapping, overwriteEmptySvg, setExecutePressed }) => {

  const processCode = async () => {
    const codeValue = editorRef.current.getValue();  // get code value from editor

    if (codeValue.length > 0) {  // there must be something written there
      if (text === "실행") {
        // set execute pressed to true
        setExecutePressed(true);
        // hide execution trace
        overwriteEmptySvg();  // overwrite the file
        setNumImages(1);  // set num Images to 1
        setExecutedLineNumbers([]);  // delete all executed line number trace
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
          // set execute pressed to false
          setExecutePressed(false);
          let resultData = await getExecutionTrace(codeValue);
          let executed_line_numbers = resultData['executed_line_numbers'];
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
        console.log("pressed button");
      }
    }
  }

  return (
    <Button size="sm" colorScheme="messenger" onClick={processCode}>{text}</Button>
  )
}

const TurtleAccordion = ({ title }) => {
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
          <pre id="output">

          </pre>
          <div id="turtle_canvas"></div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

// Store and show ast result
const ResultAccordion = ({ title, pre_id, overwriteEmptySvg, numImages, executedLineNumbers, lineAndImageMapping, currentIndex, setCurrentIndex }) => {
  const [svgSrcs, setSvgSrcs] = useState(['/code_ast.svg']);

  const fetchSvgFiles = async () => {
    const svgFiles = [];
    for (let i = 0; i < executedLineNumbers.length; i++) {
      try {
        let lineNumber = executedLineNumbers[i];
        let filename = lineAndImageMapping[lineNumber];
        const response = await fetch(filename);
        if (response.ok) {
          const svgData = await response.text();
          svgFiles.push(`data:image/svg+xml;base64,${btoa(svgData)}`);
        } else {
          console.log(`Failed to fetch SVG file ${filename}`);
        }
      } catch (error) {
        console.error(`Error fetching SVG file`, error);
      }
    }
    setSvgSrcs(svgFiles);
  };

  const handleNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % svgSrcs.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + svgSrcs.length) % svgSrcs.length);
  }

  useEffect(() => {
    if (overwriteEmptySvg !== undefined && overwriteEmptySvg !== null) {
      overwriteEmptySvg();  // empty code_ast_1.svg on startup
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchSvgFiles, 2000);
    setCurrentIndex(0);  // reset to the first image
    return () => clearInterval(intervalId);
  }, [numImages])

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
          {svgSrcs.length > 1 && (
            <Flex justifyContent="center" alignItems="center">
              <Button onClick={handlePrevImage}>&lt;</Button>
              <Spacer/>
              <Text>{`${currentIndex + 1}/${svgSrcs.length}`}</Text>
              <Spacer/>
              <Button onClick={handleNextImage}>&gt;</Button>
            </Flex>
          )}
          <pre id={pre_id}>
            <img src={svgSrcs[currentIndex]}></img>
          </pre>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default function RunResultSection({ onExecuteSuccess, overwriteEmptySvg, getExecutionTrace }) {
  const editorRef = useRef(null);  // code editor ref
  const [numImages, setNumImages] = useState(0);  // number of images to show for result
  const [runSectionWidth, setRunSectionWidth] = useState(63);  // for gutter
  const [executedLineNumbers, setExecutedLineNumbers] = useState([]);  // executed line numbers
  const [lineAndImageMapping, setLineAndImageMapping] = useState({});  // line number and image url mapping
  const [currentIndex, setCurrentIndex] = useState(0);  // index of shown result image
  const isDragging = useRef(false);
  const [executePressed, setExecutePressed] = useState(false);  // keep track of whether 실행 is pressed

  // handling sliding the gutter
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = runSectionWidth;

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = startWidth + ((e.clientX - startX) / window.innerWidth) * 100;
      setRunSectionWidth(Math.max(0, Math.min(startWidth, newWidth)));  // cannot slide below startWidth
      document.body.style.userSelect = 'none';
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.userSelect = 'auto';
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  }

  return (
    <div className="container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <div className="run-section" style={{ width: `${runSectionWidth}%` }}>
        <div className='copy-and-save-section'>
          <div className="left-buttons">
            <UtilityButton
              editorRef={editorRef}
              text={'Copy'}
              url={'copy_icon.svg'}
            >
            </UtilityButton>
            <UtilityButton
              editorRef={editorRef}
              text={'Undo'}
              url={'undo_icon.svg'}
            >
            </UtilityButton>
            <UtilityButton
              editorRef={editorRef}
              text={'Save'}
              url={'save_icon.svg'}
            >
            </UtilityButton>
          </div>
          <div className="right-buttons">
            <EditorButton 
              text={'실행'} 
              editorRef={editorRef} 
              onExecute={onExecuteSuccess}
              getExecutionTrace={null}
              setNumImages={setNumImages}
              setExecutedLineNumbers={setExecutedLineNumbers}
              setLineAndImageMapping={null}
              overwriteEmptySvg={overwriteEmptySvg}
              setExecutePressed={setExecutePressed}
            />
            <EditorButton
              text={'분석'}
              editorRef={editorRef}
              onExecute={onExecuteSuccess}
              getExecutionTrace={getExecutionTrace}
              setNumImages={setNumImages}
              setExecutedLineNumbers={setExecutedLineNumbers}
              setLineAndImageMapping={setLineAndImageMapping}
              overwriteEmptySvg={null}
              setExecutePressed={setExecutePressed}
            />
            <EditorButton
              text={'비교'}
              editorRef={editorRef}
              onExecute={null}
              getExecutionTrace={null}
              setNumImages={null}
              setExecutedLineNumbers={null}
              setLineAndImageMapping={null}
              overwriteEmptySvg={null}
              setExecutePressed={null}
            />
          </div>
        </div>
        <CodeEditor editorRef={editorRef} highlightLine={executedLineNumbers[currentIndex]} executePressed={executePressed}/>
      </div>
      <div className="gutter" onMouseDown={handleMouseDown}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
      <div className="result-section" style={{ width: `${100 - runSectionWidth}%` }}>
        <div className='result-section'>
          <TurtleAccordion title={"실행 결과"} />
          <ResultAccordion 
            title={"코드 구조 및 실행 순서"} 
            pre_id="structure" 
            overwriteEmptySvg={overwriteEmptySvg}
            numImages={numImages}
            executedLineNumbers={executedLineNumbers}
            lineAndImageMapping={lineAndImageMapping}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </div>
      </div>
    </div>
  );
}