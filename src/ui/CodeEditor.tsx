import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { KeyboardEvent } from 'react';

interface CodeEditorProps {
	ariaLabel: string;
	editable: boolean;
	value: string;
	onChange: (value: string) => void;
	onRunShortcut: () => void;
}

export function CodeEditor({ ariaLabel, editable, value, onChange, onRunShortcut }: CodeEditorProps) {
	function handleKeyDown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			onRunShortcut();
		}
	}

	return (
		<CodeMirror
			aria-label={ariaLabel}
			basicSetup
			editable={editable}
			extensions={[javascript({ jsx: true })]}
			height="100%"
			theme={oneDark}
			value={value}
			onChange={onChange}
			onKeyDown={handleKeyDown}
		/>
	);
}
