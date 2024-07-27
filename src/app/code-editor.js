'use client'

import React, { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ editorRef, codeValue, highlightLine }) {
  const decorationsRef = useRef([]);

  const applyHighlight = useCallback((monacoEditor, shouldHighlight = true) => {
    const monaco = window.monaco;
    const model = monacoEditor.getModel();
    if (!model) return;

    if (!shouldHighlight) {
      // Clear the decorations
      decorationsRef.current = monacoEditor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const totalLines = model.getLineCount();
    if (highlightLine <= 0 || highlightLine > totalLines) {
      console.error('Invalid line number for highlighting');
      return;
    }

    const newRange = new monaco.Range(
      highlightLine,
      1,
      highlightLine,
      model.getLineMaxColumn(highlightLine)
    );

    const newDecorations = [
      {
        range: newRange,
        options: {
          isWholeLine: true,
          className: 'highlight-line'
        }
      }
    ];

    // Remove previous decorations and apply new ones
    const currentDecorations = monacoEditor.deltaDecorations(decorationsRef.current, newDecorations);
    decorationsRef.current = currentDecorations;
  }, [highlightLine]);

  const onMount = (monacoEditor) => {
    editorRef.current = monacoEditor;
    monacoEditor.focus();

    // Apply highlight if the model is already initialized
    const model = monacoEditor.getModel();
    if (model) {
      if (highlightLine > 0) {
        applyHighlight(monacoEditor);
      }

      // Listen for content changes and clear highlight if necessary
      const onChange = () => {
        applyHighlight(monacoEditor, false); // Clear decorations on content change
      };

      model.onDidChangeContent(onChange);
    }
  };

  useEffect(() => {
    if (editorRef.current && highlightLine > 0) {
      const model = editorRef.current.getModel();
      if (model) {
        const totalLines = model.getLineCount();
        if (highlightLine <= totalLines) {
          applyHighlight(editorRef.current);
        }
      }
    }
  }, [highlightLine, editorRef, applyHighlight]);

  return (
    <>
      <Editor
        flex="1"
        theme="vs-dark"
        defaultLanguage="python"
        value={codeValue}
        onMount={onMount}
        options={{
          minimap: { enabled: false },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          }
        }}
      />
    </>
  );
}

export default CodeEditor;