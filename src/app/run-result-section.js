'use client'

import React from "react";
import EditorButton from "./buttons/editor-button";
import CodeEditor from "./editor/code-editor";
import CodeDiffEditor from "./editor/code-diff-editor";
import UtilityButton from "./buttons/utility-button";
import TurtleAccordion from "./accordions/turtle-accordion";
import ResultAccordion from "./accordions/result-accordion";
import { useState, useRef } from 'react';
import { Stack } from '@chakra-ui/react';
import { Radio, RadioGroup } from "@chakra-ui/react";

const RunResultSection = ({
  onExecuteSuccess,
  getExecutionTrace,
  problemAnswer,
  numImages,
  setNumImages,
  executedLineNumbers,
  setExecutedLineNumbers,
  lineAndImageMapping,
  setLineAndImageMapping,
}) => {
  const initialRunSectionWidth = 70;
  const isDragging = useRef(false);
  const editorRef = useRef(null);  // code editor ref
  const [runSectionWidth, setRunSectionWidth] = useState(initialRunSectionWidth);  // for gutter
  const [currentIndex, setCurrentIndex] = useState(0);  // index of shown result image
  const [executePressed, setExecutePressed] = useState(false);  // keep track of whether 실행 is pressed
  const [activeEditor, setActiveEditor] = useState('editor');  // keep track of which editor is active at the moment
  const [editorContent, setEditorContent] = useState('from turtle import *\r\n');  // keep track of the editor contents
  const [compareText, setCompareText] = useState('비교');  // '비교' and 'Back'
  const [checkedItem, setCheckedItem] = useState('normal');  // check which speed is clicked
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckChange = (value) => {
    setCheckedItem(value);
  };

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
        <div className="utility-section">
          <div className='copy-and-save-section'>
            {shouldShowButtons() && (
              <>
                <div className="left-buttons">
                  <UtilityButton
                    editorRef={editorRef}
                    text={'Copy'}
                    url={'copy_icon.svg'}
                    setExecutePressed={setExecutePressed}
                    setNumImages={setNumImages}
                    setExecutedLineNumbers={setExecutedLineNumbers}
                  >
                  </UtilityButton>
                  <UtilityButton
                    editorRef={editorRef}
                    text={'Reset'}
                    url={'undo_icon.svg'}
                    setExecutePressed={setExecutePressed}
                    setNumImages={setNumImages}
                    setExecutedLineNumbers={setExecutedLineNumbers}
                  >
                  </UtilityButton>
                  <UtilityButton
                    editorRef={editorRef}
                    text={'Save'}
                    url={'save_icon.svg'}
                    setExecutePressed={setExecutePressed}
                    setNumImages={setNumImages}
                    setExecutedLineNumbers={setExecutedLineNumbers}
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
                        executePressed={executePressed}
                        setExecutePressed={setExecutePressed}
                        setCompareText={setCompareText}
                        activeEditor={activeEditor}
                        setActiveEditor={setActiveEditor}
                        setEditorContent={setEditorContent}
                        checkedItem={checkedItem}
                        setIsLoading={setIsLoading}
                      />
                      <EditorButton
                        text={'분석'}
                        editorRef={editorRef}
                        onExecute={onExecuteSuccess}
                        getExecutionTrace={getExecutionTrace}
                        setNumImages={setNumImages}
                        setExecutedLineNumbers={setExecutedLineNumbers}
                        setLineAndImageMapping={setLineAndImageMapping}
                        executePressed={executePressed}
                        setExecutePressed={setExecutePressed}
                        setCompareText={setCompareText}
                        activeEditor={activeEditor}
                        setActiveEditor={setActiveEditor}
                        setEditorContent={setEditorContent}
                        checkedItem={checkedItem}
                        setIsLoading={setIsLoading}
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
                    executePressed={executePressed}
                    setExecutePressed={null}
                    setCompareText={setCompareText}
                    activeEditor={activeEditor}
                    setActiveEditor={setActiveEditor}
                    setEditorContent={setEditorContent}
                    checkedItem={checkedItem}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </>
            )}
          </div>
          <div className="speed-section">
            {shouldShowButtons() && (
              <>
                <RadioGroup colorScheme='blue'>
                  <Stack direction={['column', 'row']}>
                    <Radio isChecked={checkedItem === 'slow'} onChange={() => handleCheckChange('slow')}>Slow</Radio>
                    <Radio isChecked={checkedItem === 'normal'} onChange={() => handleCheckChange('normal')}>Normal</Radio>
                    <Radio isChecked={checkedItem === 'fast'} onChange={() => handleCheckChange('fast')}>Fast</Radio>
                  </Stack>
                </RadioGroup>
              </>
            )}
          </div>
        </div>
        {activeEditor === 'editor' && (
          <CodeEditor
            editorRef={editorRef}
            editorContent={editorContent}
            highlightLine={executedLineNumbers[currentIndex] - 6}
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
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default RunResultSection;