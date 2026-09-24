const RULE_ID = 'horizons/no-unicode-escapes-in-jsx';
const MAX_DETAILED_FINDINGS = 25;
const ESCAPE_FROM_MESSAGE_PATTERN = /^Literal Unicode escape "(\\u(?:[0-9a-fA-F]{4}|\{[0-9a-fA-F]{1,6}\}))"/;
const GUIDANCE = 'Unicode escapes in JSX text or quoted attributes may be displayed verbatim to website visitors. Replace every escape in affected JSX in place with its intended literal character (for example, use "ç", not "\\u00e7"). Do not move the text into variables, objects, or JSX expressions, and do not wrap escapes in JSX braces ({}).';

function selectFindingsAcrossFiles(findings) {
	const findingsByFile = new Map();
	for (const finding of findings) {
		const fileFindings = findingsByFile.get(finding.filePath) ?? [];
		fileFindings.push(finding);
		findingsByFile.set(finding.filePath, fileFindings);
	}

	const shown = [];
	for (let findingIndex = 0; shown.length < MAX_DETAILED_FINDINGS; findingIndex++) {
		let addedFinding = false;

		for (const fileFindings of findingsByFile.values()) {
			const finding = fileFindings[findingIndex];
			if (finding) {
				shown.push(finding);
				addedFinding = true;
			}

			if (shown.length === MAX_DETAILED_FINDINGS) {
				break;
			}
		}

		if (!addedFinding) {
			break;
		}
	}

	return shown;
}

export default function format(results) {
	const findings = results.flatMap(result =>
		result.messages
			.filter(message => message.ruleId === RULE_ID)
			.map(message => ({ filePath: result.filePath, ...message })),
	);

	if (findings.length === 0) {
		return '';
	}

	const shown = selectFindingsAcrossFiles(findings);
	const lines = [
		GUIDANCE,
		...shown.map((finding) => {
			const escape = finding.message.match(ESCAPE_FROM_MESSAGE_PATTERN)?.[1] ?? 'Unicode escape';
			return `${finding.filePath}:${finding.line}:${finding.column} warning ${escape} ${RULE_ID}`;
		}),
	];
	const omitted = findings.length - shown.length;
	lines.push(`Found ${findings.length} Unicode escapes; ${omitted} additional findings omitted. Replace all escapes in affected JSX. [horizons-unicode-escapes] total=${findings.length} shown=${shown.length} omitted=${omitted}`);

	return `${lines.join('\n')}\n`;
}
