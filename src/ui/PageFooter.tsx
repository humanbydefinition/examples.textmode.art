import { IMPRINT_URL, PRIVACY_URL } from '../domain/registry';

interface PageFooterProps {
	label: string;
	docsUrl?: string;
	showDocsLink?: boolean;
}

export function PageFooter({
	label,
	docsUrl = 'https://code.textmode.art',
	showDocsLink = true,
}: PageFooterProps) {
	return (
		<footer className="examples-footer">
			<p>{label}</p>
			<nav className="examples-footer-links" aria-label="Project links">
				{showDocsLink ? (
					<a href={docsUrl} target="_blank" rel="noopener noreferrer">
						docs
					</a>
				) : null}
				<a href={IMPRINT_URL} target="_blank" rel="noopener noreferrer">
					imprint
				</a>
				<a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
					privacy
				</a>
			</nav>
		</footer>
	);
}
