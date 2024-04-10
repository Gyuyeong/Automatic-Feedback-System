import "./globals.css";
import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import RunResultSection from "./run-result-section";
import Script from "next/script";
import { sql } from "@vercel/postgres";

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
  async function handleSaveCode(codeValue, pngData) {
    "use server";  // must add this
    if (codeValue && pngData) {
      // console.log(codeValue);
      await sql`INSERT INTO Code_Results (Code, Image) VALUES (${codeValue}, ${pngData})`;  // insert to db
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
            <RunResultSection value={value} onExecuteSuccess={handleSaveCode}></RunResultSection>
          </div>
        </div>
      </ChakraProvider>
      <Script src="/skulpt.min.js" type='text/javascript'></Script>
      <Script src="/skulpt-stdlib.js" type='text/javascript'></Script>
    </>
  );
}
