'use client'

import React from "react";
// import Turtle from 'react-turtle';
import Turtle from './turtle.js';
import { Box } from "@chakra-ui/react";
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';


// Stores the results
const ResultAccordion = ({ title, executionResult }) => {
    console.log(executionResult);
    return (
      <Accordion allowToggle bg="#111" border="none">
        <AccordionItem>
          <h2>
            <AccordionButton bg='#111' color='gray' _expanded={{bg: '#111', color: 'white'}}>
              <Box as="span" flex='1'textAlign='left' fontSize="large" fontWeight="bold" ml="1px">
                {title}
              </Box>
              <AccordionIcon/>
            </AccordionButton>
          </h2>
          <AccordionPanel bg="#fff" margin='10px'>
            {executionResult}
            {/* <Turtle 
              draw={(turtle) => {
                turtle
                  .forward(32)
                  .right()
                  .forward(32)
                  .left(45)
                  .forward(32)
                  .stroke()
              }}
              animated={true}></Turtle> */}
              <Turtle></Turtle>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

export default function ResultSection({ result }) {
    return (
        <>
          {/* <div className="result-section"> */}
            <div className='result-section'>
              <ResultAccordion title={"실행 결과"} executionResult={result}></ResultAccordion>
              <ResultAccordion title={"코드 구조 및 실행 순서"} executionResult={""}></ResultAccordion>
            </div>
          {/* </div> */}
        </>
    )
}