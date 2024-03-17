import "./globals.css";
import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import RunSection from "./run-section";
import ResultSection from "./result-section";
import { PythonShell } from "python-shell";
import json_src from '../../parsed_python_file.json';

// write the written code to local file
const writeToFile = data => {
  const fse = require('fs-extra');
  fse.outputFile('./run.py', data)
  .then(( ) => {
    console.log("File saved");
  })
  .catch(err => {
    console.log("Failed to write to file");
    console.log(err);
  })
}

// run the code
const runCode = async () => {
  let result = await PythonShell.run('parse_turtle.py', {
    mode: 'text',
    scriptPath: './',
  }).then((results) => {
    return results;
  }).catch((err) => {
    console.log(err);
    // show error
    // return err;
  });
  return result;
}

// Stores problem guide information
const GuideContainer = ({ titleText, height, text }) => {
  const containerStyle = {
    height: height || 'auto',
    overflowY: 'scroll'
  };

  return (
    <div>
      <div className="title-text">
        {titleText}
      </div>
      <div style={containerStyle} className="scrollable-container">
        {text}
      </div>
    </div>
  )
}

export default async function Home({ params, searchParams }) {
  let result = "";  // result of the executed code
  const codeValue = searchParams['codeValue'];

  if (codeValue) {
    // checkTurtle(codeValue);
    writeToFile(codeValue);
    result = await runCode();
  }

  const longText = "hello";
  const longText2 = "world";

  return (
    <>
      <ChakraProvider>
          <div className="main">
            <div className="main-section">
              <div className="guide-section">
                <div className="guide-title">문제 & 참조 / 제약사항</div>
                <GuideContainer titleText={'문제 설명'} height={'200px'} text={longText}></GuideContainer>
                <GuideContainer titleText={'제한 사항'} height={'200px'} text={longText2}></GuideContainer>
              </div>
              <div className="gutter">

              </div>
              <div className="run-section">
                <RunSection></RunSection>
              </div>
              <div className="result-section">
                <ResultSection result={result} json_src={json_src}></ResultSection>
              </div>
            </div>
          </div>
        </ChakraProvider>
    </>
  );
}
