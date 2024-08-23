'use client'

import { Button } from '@chakra-ui/react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';


const ProblemSection = ({ problems, currentProblemIndex, setCurrentProblemIndex }) => {
//   console.log(problems);
  const handleMenuItemClick = (index) => {
    setCurrentProblemIndex(index);
  };

  return (
    <>
      <div className="problem-section">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>{problems[currentProblemIndex]['name']}</MenuButton>
          <MenuList>
            {problems.map((problem, index) => (
                <MenuItem 
                  key={index} 
                  isDisabled={index === currentProblemIndex} 
                  onClick={() => handleMenuItemClick(index)}>
                    {problem['name']}
                </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </div>
    </>
  )
}

export default ProblemSection;