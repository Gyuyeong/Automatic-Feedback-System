'use client';

import { useState } from "react";
import ProblemSection from "./problem-section";
import GuideContainer from "./guide-container";
import RunResultSection from "./run-result-section";

const MainContent = ({
    problems,  // problem list
    handleSaveCode,  // save code function
    getExecutionTrace  // function to get the ast of the code
}) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  let problemText = problems[currentProblemIndex]['problem'];
  let requirementText = problems[currentProblemIndex]['requirements'];  
  return (
    <>
      <div className="main-content">
        <ProblemSection 
          problems={problems} 
          currentProblemIndex={currentProblemIndex} 
          setCurrentProblemIndex={setCurrentProblemIndex}>
        </ProblemSection>
        <div className="main-section">
          <div className="guide-section">
            <div className="guide-title">문제 & 참조 / 제약사항</div>
            <GuideContainer titleText={'문제 설명'} height={'200px'} text={problemText}></GuideContainer>
            <GuideContainer titleText={'제한 사항'} height={'200px'} text={requirementText}></GuideContainer>
          </div>
          <RunResultSection 
            onExecuteSuccess={handleSaveCode} 
            getExecutionTrace={getExecutionTrace}
            problemAnswer={problems[currentProblemIndex]}
          ></RunResultSection>
        </div>
      </div>
    </>
  )
}

export default MainContent;