import { IMPRINT_URL, PRIVACY_URL } from '../domain/registry';

interface PageFooterProps {
	label: string;
	githubUrl?: string;
	docsUrl?: string;
}

export function PageFooter({ label, githubUrl, docsUrl = 'https://code.textmode.art' }: PageFooterProps) {
	return (
		<footer className="examples-footer">
			<p>{label}</p>
			<nav className="examples-footer-links" aria-label="Project links">
				<a href="https://github.com/humanbydefinition" target="_blank" rel="noopener noreferrer">
					<span className="footer-link-label footer-link-label-desktop">@humanbydefinition</span>
					<span className="footer-link-label footer-link-label-mobile">@hbd</span>
				</a>
				{githubUrl ? (
					<a href={githubUrl} target="_blank" rel="noopener noreferrer">
						github
					</a>
				) : null}
				<a href={docsUrl} target="_blank" rel="noopener noreferrer">
					docs
				</a>
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
