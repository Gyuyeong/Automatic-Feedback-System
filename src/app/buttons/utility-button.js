'use client'

import { Button } from "@chakra-ui/react";

// utility buttons
// copy reset save
const UtilityButton = ({ editorRef, text, url, setExecutePressed, setNumImages, setExecutedLineNumbers }) => {
    const processCode = async () => {
      const codeValue = editorRef.current.getValue();
  
      if (codeValue.length > 0) {
        if (text === 'Copy') {
          navigator.clipboard.writeText(codeValue);  // copy to clipboard
          alert("Copied to Clipboard");
        } else if (text === 'Reset') {
          const confirmed = window.confirm('Are you sure you want to reset the code?');
          if (confirmed) {
            // reset code to default
            editorRef.current.setValue('from turtle import *\r\n');
            // clear analysis results
            setExecutePressed(false);
            setNumImages(0);
            setExecutedLineNumbers([]);

            // clear turtle content
            const turtleCanvas = document.getElementById('turtle_canvas');
            if (turtleCanvas) {
                turtleCanvas.innerHTML = '';
            }
          }
        } else if (text === 'Save') {
          const blob = new Blob([codeValue], {type: 'text/x-python'});
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'code.py';
          link.click();
  
          URL.revokeObjectURL(link.href);
        }
      }
    };
  
    const buttonStyle = {
      backgroundImage: `url(/${url})`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'inherit',
    };
  
    return <Button size='sm'
      className='copy-button'
      onClick={processCode}
      style={buttonStyle}>
    </Button>
  }

  export default UtilityButton;