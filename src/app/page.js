import "./globals.css";
import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import RunResultSection from "./run-result-section";
import Script from "next/script";
import { sql } from "@vercel/postgres";
import { exec } from 'child_process';

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

export default async function Home() {
  const longText = "hello";
  const longText2 = "world";

  let value;
  // Save the code and image to DB
  // this function is called in the client component
  async function handleSaveCode(codeValue, pngData) {
    "use server";  // must add this
    if (codeValue && pngData) {
      await sql`INSERT INTO Code_Results (Code, Image) VALUES (${codeValue}, ${pngData})`;  // insert to db
    }
  }

  async function generateASTGraph(codeValue, executedNumberSequence) {
    "use server"
    return new Promise((resolve, reject) => {
      let resultData = '';
      if (codeValue) {
        const { spawn } = require('child_process');
        const pythonProcess = spawn('python', ['./scripts/graph.py']);
  
        const inputData = {
          code: codeValue,
          executedSequence: executedNumberSequence
        };
  
        const jsonString = JSON.stringify(inputData);
  
        pythonProcess.stdin.write(jsonString);
        pythonProcess.stdin.end();
  
        pythonProcess.stdout.on('data', (data) => {
          resultData += data.toString();
          resolve(resultData);
        });
  
        pythonProcess.stderr.on('data', (data) => {
          console.error(data.toString());
          reject(data.toString());
        });
  
        pythonProcess.on('exit', (code) => {
          if (code === 0) {
            resolve(resultData);
          } else {
            reject(`Child process exited with code ${code}`);
          }
        });
      } else {
        reject('No code value provided');
      }
    });
  }

  // reset code_ast_1.svg on startup
  async function overwriteEmptySvg() {
    "use server";
    const fs = require('fs').promises;
    const path = require('path');
    try {
      const svgFilePath = path.join(process.cwd(), 'public', 'code_ast_1.svg');
      await fs.writeFile(svgFilePath, '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg"></svg>')
    } catch (error) {
      console.error("Error overwriting SVG file:", error);
    }
  }

  // write given code to file
  async function writeTurtleCodeToFile(codeValue) {
    "use server";
    const fs = require('fs').promises;
    const path = require('path');
    try {
      const turtleCodeFilePath = path.join(process.cwd(), 'scripts', 'turtle_code.py');
      const turtleCodeTraceFilePath = path.join(process.cwd(), 'scripts', 'turtle_code_trace.py');

      let lines = codeValue.trim().split('\r\n');
      // =========== need to fix for robustness =========== //
      lines.shift();  // remove 'from turtle import *'
      // =========== need to fix for robustness =========== //

      // imports to not spawn the turtle window in the local
      let traceLines = [
        'from unittest.mock import Mock',
        'import turtle',
        'from turtle import *',
        'turtle.Screen = Mock()',
        'turtle.Turtle = Mock()',
        'screen = turtle.Screen()',
        ...lines
      ];
      const traceCodeValue = traceLines.join('\r\n');
      await fs.writeFile(turtleCodeFilePath, codeValue);
      await fs.writeFile(turtleCodeTraceFilePath, traceCodeValue);
    } catch (error) {
      console.error("Error writing code:", error);
    }
  }

  // generate AST and get execution trace of given program
  async function getExecutionTrace(codeValue) {
    "use server";
    if (codeValue) {
      writeTurtleCodeToFile(codeValue);  // write turtle code to file
      const commandWindows = 'python -m trace -t ./scripts/turtle_code_trace.py | findstr "turtle_code_trace.py"';  // Windows
      const commandLinux = 'python -m trace -t ./scripts/turtle_code_trace.py | grep turtle_code_trace.py';  // linux

      return new Promise((resolve, reject) => {
        exec(commandWindows, async (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject(-1);
            return;
          }
          if (stderr) {
            console.error(`stderr: ${stderr}`);
            reject(-1);
            return -1;
          }
  
          let lines = stdout.split('\r\n');
          let executedNumberSequence = [];
          for (let i = 0; i < lines.length; i++) {
            let match = lines[i].match(/turtle_code_trace\.py\(\d+\): (.+)/);
            let matchNum = lines[i].match(/turtle_code_trace\.py\((\d+)\)/);
  
            if (match && matchNum) {
              let lineNumber = matchNum[1];
              executedNumberSequence.push(lineNumber);  // push line numbers in order
            }
          }
          const numImages = executedNumberSequence.length - 6;
          let resultData = await generateASTGraph(codeValue, executedNumberSequence);
          if (resultData !== undefined && resultData !== null) {
            resultData = JSON.parse(resultData);
            resultData['num_images'] = numImages;
            resolve(resultData);
          }
          // need to handle error cases
          // resolve(numImages);
        })
      });
    } else {
      return -1;
    }
  }

  return (
    <>
      <ChakraProvider>
        <div className="main">
          <div className="main-content">
            <div className="main-section">
              <div className="guide-section">
                <div className="guide-title">문제 & 참조 / 제약사항</div>
                <GuideContainer titleText={'문제 설명'} height={'200px'} text={longText}></GuideContainer>
                <GuideContainer titleText={'제한 사항'} height={'200px'} text={longText2}></GuideContainer>
              </div>
              {/* <div className="gutter"></div> */}
              <RunResultSection 
                value={value} 
                onExecuteSuccess={handleSaveCode} 
                overwriteEmptySvg={overwriteEmptySvg}
                getExecutionTrace={getExecutionTrace}
              ></RunResultSection>
            </div>
          </div>
        </div>
      </ChakraProvider>
      <Script src="/skulpt.min.js" type='text/javascript'></Script>
      <Script src="/skulpt-stdlib.js" type='text/javascript'></Script>
    </>
  );
}
