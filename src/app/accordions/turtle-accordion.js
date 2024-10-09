'use client'

import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react';
import { Box } from "@chakra-ui/react";

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

export default TurtleAccordion;