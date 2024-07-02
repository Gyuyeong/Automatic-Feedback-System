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
      // console.log(codeValue);
      await sql`INSERT INTO Code_Results (Code, Image) VALUES (${codeValue}, ${pngData})`;  // insert to db
    }
  }

  // generate AST graph
  async function generateASTGraph(codeValue) {
    "use server";
    if (codeValue) {
      const { spawn } = require('child_process');
      const pythonProcess = spawn('python', ['./scripts/graph.py']);

      pythonProcess.stdin.write(codeValue);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      pythonProcess.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
      });
    }
  }

  // reset code_ast.svg on startup
  async function overwriteEmptySvg() {
    "use server";
    const fs = require('fs').promises;
    const path = require('path');
    try {
      const svgFilePath = path.join(process.cwd(), 'public', 'code_ast.svg');
      await fs.writeFile(svgFilePath, '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg"></svg>')
    } catch (error) {
      console.error("Error overwriting SVG file:", error);
    }
  }

  async function writeTurtleCodeToFile(codeValue) {
    "use server";
    const fs = require('fs').promises;
    const path = require('path');
    try {
      const turtleCodeFilePath = path.join(process.cwd(), 'scripts', 'turtle_code.py');
      await fs.writeFile(turtleCodeFilePath, codeValue);
    } catch (error) {
      console.error("Error writing code:", error);
    }
  }

  async function getExecutionTrace(codeValue) {
    "use server";
    if (codeValue) {
      writeTurtleCodeToFile(codeValue);  // write turtle code to file
      const commandWindows = 'python -m trace -t ./scripts/turtle_code.py | findstr "turtle_code.py"';  // Windows
      const commandLinux = 'python -m trace -t ./scripts/turtle_code.py | grep turtle_code.py';  // linux

      exec(commandWindows, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        let lines = stdout.split('\r\n');
        let regex = /turtle_code\.py\(\d+\): (.+)/;

        for (let i = 0; i < lines.length; i++) {
          let match = lines[i].match(regex);

          if (match) {
            let lineOfCode = match[1];
            console.log(lineOfCode);
          }
        }
        return;
      });
    }

  }

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
            <RunResultSection 
              value={value} 
              onExecuteSuccess={handleSaveCode} 
              generateASTGraph={generateASTGraph} 
              overwriteEmptySvg={overwriteEmptySvg}
              getExecutionTrace={getExecutionTrace}
            ></RunResultSection>
          </div>
        </div>
      </ChakraProvider>
      <Script src="/skulpt.min.js" type='text/javascript'></Script>
      <Script src="/skulpt-stdlib.js" type='text/javascript'></Script>
    </>
  );
}
