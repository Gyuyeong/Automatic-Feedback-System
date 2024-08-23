import "./globals.css";
import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import MainContent from "./main-content";
import Script from "next/script";
import { sql } from "@vercel/postgres";
import { exec } from 'child_process';

export const dynamic = 'force-dynamic';  // change cache behavior for select query

export default async function Home() {
  const problemResults = await sql`SELECT * FROM Problems;`;  // query all problems
  const problems = problemResults.rows;  // problems stored in DB

  // Save the code and image to DB
  async function handleSaveCode(codeValue, pngData) {
    "use server";  // must add this
    if (codeValue && pngData) {
      await sql`INSERT INTO Code_Results (Code, Image) VALUES (${codeValue}, ${pngData})`;  // insert to db
    }
  }

  // spawns Python graph.py and generate AST
  async function generateASTGraph(codeValue, executedNumberSequence) {
    "use server"
    return new Promise((resolve, reject) => {
      let resultData = '';
      if (codeValue) {
        const { spawn } = require('child_process');
        const pythonProcess = spawn('python', ['./scripts/graph.py']);
  
        // data to pass to graph.py
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

  // write given code to file
  async function writeTurtleCodeToFile(codeValue) {
    "use server";
    const fs = require('fs').promises;
    const path = require('path');
    try {
      const turtleCodeFilePath = path.join(process.cwd(), 'scripts', 'turtle_code.py');
      const turtleCodeTraceFilePath = path.join(process.cwd(), 'scripts', 'turtle_code_trace.py');

      let lines = codeValue.trim().split('\r\n');
      lines.shift();  // remove 'from turtle import *'

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
      // write code to separate files
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
  
          let lines = stdout.split('\r\n');  // executed lines in order using trace
          let executedNumberSequence = [];
          for (let i = 0; i < lines.length; i++) {
            let match = lines[i].match(/turtle_code_trace\.py\(\d+\): (.+)/);
            let matchNum = lines[i].match(/turtle_code_trace\.py\((\d+)\)/);
  
            if (match && matchNum) {
              let lineNumber = matchNum[1];
              executedNumberSequence.push(lineNumber);  // push line numbers in order
            }
          }
          // need to fix for robustness
          const numImages = executedNumberSequence.length - 6;
          // need to fix for robustness
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
          <MainContent 
            problems={problems} 
            handleSaveCode={handleSaveCode} 
            getExecutionTrace={getExecutionTrace}>
          </MainContent>
        </div>
      </ChakraProvider>
      <Script src="/skulpt.min.js" type='text/javascript'></Script>
      <Script src="/skulpt-stdlib.js" type='text/javascript'></Script>
    </>
  );
}
