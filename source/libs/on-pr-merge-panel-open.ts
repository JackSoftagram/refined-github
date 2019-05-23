
//To try the Dependency violations
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber, getOP} from '../libs/utils';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

interface Author {
	email: string;
	name: string; // Used when the commit isn't linked to a GitHub user
	user: {
		name: string;
		login: string;
	};
}

let coAuthors: Author[];

async function fetchCoAuthoredData(): Promise<Author[]> {
	const prNumber = getDiscussionNumber();
	const {ownerName, repoName} = getOwnerAndRepo();

	const userInfo = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${prNumber}) {
					commits(first: 100) {
						nodes {
							commit {
								author {
									email
									name
									user {
										login
										name
									}
								}
							}
						}
					}
				}
			}
		}`
	);

	return userInfo.repository.pullRequest.commits.nodes.map((node: AnyObject) => node.commit.author as Author);
}
import './fit-textareas.css';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import fitTextarea from 'fit-textarea';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function listener({delegateTarget: textarea}: DelegateEvent<Event, HTMLTextAreaElement>): void {
function enable(textarea: HTMLTextAreaElement): void {
	// `fit-textarea` adds only once listener
	fitTextarea.watch(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}


/// Testing dependency violation rules, All bove to be removed



// Memoization here is used to let onPrMergePanelOpen() be called multiple times without risking multiple attached handlers
import mem from 'mem';
import delegate, {DelegateSubscription, DelegateEvent} from 'delegate-it';

const delegateHandler = mem((callback: EventListener) => (event: DelegateEvent) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

const sessionResumeHandler = mem((callback: EventListener) => async (event: Event) => {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	callback(event);
});

export default function (callback: EventListener): DelegateSubscription[] {
	document.addEventListener(
		'session:resume',
		sessionResumeHandler(callback)
	);

	return [
		{
			// Imitate a DelegateSubscription for this event as well
			destroy() {
				document.removeEventListener(
					'session:resume',
					sessionResumeHandler(callback)
				);
			}
		},
		...delegate(
			'#discussion_bucket',
			'.js-merge-pr:not(.is-rebasing)',
			'details:toggled',
			delegateHandler(callback)
		)
	];
}
