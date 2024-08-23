'use client'

import React , { useRef, useEffect, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';

function CodeDiffEditor({writtenCode, answerCode}) {
  return (
    <>
      <DiffEditor
        height='100%'
        language='python'
        theme='vs-dark'
        original={answerCode}
        modified={writtenCode}
      >

      </DiffEditor>
    </>
  )
}

export default CodeDiffEditor;