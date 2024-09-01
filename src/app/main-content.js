'use client';

import { useState } from "react";
import ProblemSection from "./problem-section";
import GuideContainer from "./guide-container";
import RunResultSection from "./run-result-section";

const MainContent = ({
  problems,  // problem list
  handleSaveCode,  // save code function
  getExecutionTrace,  // function to get the ast of the code
  problemIndex  // current problem index
}) => {
  const [numImages, setNumImages] = useState(0);  // number of images to show for result
  const [executedLineNumbers, setExecutedLineNumbers] = useState([]);  // executed line numbers
  const [lineAndImageMapping, setLineAndImageMapping] = useState({});  // line number and image url mapping
  let problemText = problems[problemIndex]['problem'];
  let requirementText = problems[problemIndex]['requirements'];

  return (
    <>
      <div className="main-content">
        <ProblemSection
          problems={problems}
          currentProblemIndex={problemIndex}
        >
        </ProblemSection>
        <div className="main-section">
          <div className="guide-section">
            <div className="guide-title">문제 & 참조 / 제약사항</div>
            <GuideContainer titleText={'문제 설명'} height={'300px'} text={problemText}></GuideContainer>
            <GuideContainer titleText={'제한 사항'} height={'500px'} text={requirementText}></GuideContainer>
          </div>
          <RunResultSection
            onExecuteSuccess={handleSaveCode}
            getExecutionTrace={getExecutionTrace}
            problemAnswer={problems[problemIndex]}
            numImages={numImages}
            setNumImages={setNumImages}
            executedLineNumbers={executedLineNumbers}
            setExecutedLineNumbers={setExecutedLineNumbers}
            lineAndImageMapping={lineAndImageMapping}
            setLineAndImageMapping={setLineAndImageMapping}
          ></RunResultSection>
        </div>
      </div>
    </>
  )
}

export default MainContent;