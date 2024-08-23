'use client'

import React, { useEffect } from "react";
import EditorButton from "./editor-button";
import CodeEditor from "./code-editor";
import CodeDiffEditor from "./code-diff-editor";
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
const ResultAccordion = ({ 
  title, 
  pre_id, 
  numImages, 
  executedLineNumbers, 
  lineAndImageMapping, 
  currentIndex, 
  setCurrentIndex }) => {
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
    const intervalId = setInterval(fetchSvgFiles, 500);
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

const RunResultSection = ({ 
  onExecuteSuccess, 
  getExecutionTrace, 
  problemAnswer }) => {
  const initialRunSectionWidth = 70;
  const editorRef = useRef(null);  // code editor ref
  const [numImages, setNumImages] = useState(0);  // number of images to show for result
  const [runSectionWidth, setRunSectionWidth] = useState(initialRunSectionWidth);  // for gutter
  const [executedLineNumbers, setExecutedLineNumbers] = useState([]);  // executed line numbers
  const [lineAndImageMapping, setLineAndImageMapping] = useState({});  // line number and image url mapping
  const [currentIndex, setCurrentIndex] = useState(0);  // index of shown result image
  const isDragging = useRef(false);
  const [executePressed, setExecutePressed] = useState(false);  // keep track of whether 실행 is pressed
  const [activeEditor, setActiveEditor] = useState('editor');  // keep track of which editor is active at the moment
  const [editorContent, setEditorContent] = useState('from turtle import *\r\n');  // keep track of the editor contents
  const [compareText, setCompareText] = useState('비교');  // '비교' and 'Back'

  // handle sliding gutter
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = runSectionWidth;

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = startWidth + ((e.clientX - startX) / window.innerWidth) * 100;
      setRunSectionWidth(Math.max(0, Math.min(initialRunSectionWidth, newWidth)));  // cannot slide below initialRunSectionWidth
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

  const shouldShowButtons = () => runSectionWidth > 20;  // hide buttons when width is smaller than 20%
  const shouldShowExecuteAndAnalyzeButtons = () => activeEditor === "editor";

  return (
    <div className="container" style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <div className="run-section" style={{ width: `${runSectionWidth}%` }}>
        <div className='copy-and-save-section'>
          {shouldShowButtons() && (
            <>
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
                {shouldShowExecuteAndAnalyzeButtons() && (
                  <>
                    <EditorButton 
                      text={'실행'} 
                      editorRef={editorRef} 
                      onExecute={onExecuteSuccess}
                      getExecutionTrace={null}
                      setNumImages={setNumImages}
                      setExecutedLineNumbers={setExecutedLineNumbers}
                      setLineAndImageMapping={null}
                      setExecutePressed={setExecutePressed}
                      setCompareText={setCompareText}
                      activeEditor={activeEditor}
                      setActiveEditor={setActiveEditor}
                      setEditorContent={setEditorContent}
                    />
                    <EditorButton
                      text={'분석'}
                      editorRef={editorRef}
                      onExecute={onExecuteSuccess}
                      getExecutionTrace={getExecutionTrace}
                      setNumImages={setNumImages}
                      setExecutedLineNumbers={setExecutedLineNumbers}
                      setLineAndImageMapping={setLineAndImageMapping}
                      setExecutePressed={setExecutePressed}
                      setCompareText={setCompareText}
                      activeEditor={activeEditor}
                      setActiveEditor={setActiveEditor}
                      setEditorContent={setEditorContent}
                    />
                  </>
                )}
                <EditorButton
                  text={compareText}
                  editorRef={editorRef}
                  onExecute={null}
                  getExecutionTrace={null}
                  setNumImages={null}
                  setExecutedLineNumbers={null}
                  setLineAndImageMapping={null}
                  setExecutePressed={null}
                  setCompareText={setCompareText}
                  activeEditor={activeEditor}
                  setActiveEditor={setActiveEditor}
                  setEditorContent={setEditorContent}
                />
              </div>
            </>
          )}
        </div>
        {activeEditor === 'editor' && (
          <CodeEditor 
            editorRef={editorRef} 
            editorContent={editorContent} 
            highlightLine={executedLineNumbers[currentIndex]} 
            executePressed={executePressed}
          />
        )}
        {activeEditor === 'diff' && (
          <CodeDiffEditor
            writtenCode={editorContent}
            answerCode={problemAnswer['answer']}
          />
        )}
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

export default RunResultSection;