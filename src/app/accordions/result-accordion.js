'use client'

import { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react';
import { Box } from "@chakra-ui/react";
import { Button } from '@chakra-ui/react';
import { Flex, Spacer, Center, Spinner } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';

// Store and show ast result
const ResultAccordion = ({
    title,
    pre_id,
    numImages,
    executedLineNumbers,
    lineAndImageMapping,
    currentIndex,
    setCurrentIndex,
    isLoading,
    setIsLoading
}) => {
    const [svgSrcs, setSvgSrcs] = useState(['/code_ast.svg']);
    // const [isLoading, setIsLoading] = useState(false);

    const fetchSvgFiles = async (linesToFetch) => {
        const svgFiles = [];
        for (let lineNumber of linesToFetch) {
            try {
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
        return svgFiles;
    };

    const fetchImagesInBatches = async () => {
        const batchSize = 50; // Adjust the batch size based on performance
        let allSvgFiles = [];
        for (let i = 0; i < executedLineNumbers.length; i += batchSize) {
            const linesToFetch = executedLineNumbers.slice(i, i + batchSize);
            const svgFiles = await fetchSvgFiles(linesToFetch);
            allSvgFiles = [...allSvgFiles, ...svgFiles];
            setSvgSrcs(allSvgFiles); // Update state progressively
        }
        setIsLoading(false);
    };

    const handleNextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % svgSrcs.length);
    };

    const handlePrevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + svgSrcs.length) % svgSrcs.length);
    };

    useEffect(() => {
        setIsLoading(true);
        setSvgSrcs(['/code_ast.svg']); // Reset to default image while loading
        setCurrentIndex(0); // reset to the first image
        fetchImagesInBatches(); // Start fetching images in batches
    }, [numImages]);

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
                    {isLoading ? (
                        <Center height="200px">
                            <Flex direction="column" alignItems="center">
                                <Spinner size="xl" color="blue.500" />
                                <Text fontSize="xl" color="gray.600" mt="4" fontWeight="semibold">
                                    Analyzing...
                                </Text>
                            </Flex>
                        </Center>
                    ) : (
                        <>
                            {svgSrcs.length > 1 && (
                                <Flex justifyContent="center" alignItems="center">
                                    <Button onClick={handlePrevImage}>&lt;</Button>
                                    <Spacer />
                                    <Text>{`${currentIndex + 1}/${svgSrcs.length}`}</Text>
                                    <Spacer />
                                    <Button onClick={handleNextImage}>&gt;</Button>
                                </Flex>
                            )}
                            <pre id={pre_id}>
                                <img src={svgSrcs[currentIndex]} alt="SVG Preview" />
                            </pre>
                        </>
                    )}
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

export default ResultAccordion;