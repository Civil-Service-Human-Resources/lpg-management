export interface SummaryListActionItem {
	href: string;
	text: string;
	visuallyHiddenText?: string;
	classes?: string;
	attributes?: Record<string, string>;
}

export interface SummaryListActions {
	items: SummaryListActionItem[];
}

export interface SummaryListCell {
	text?: string;
	html?: string;
	classes?: string;
}

export interface SummaryListRow {
	key: SummaryListCell;
	value: SummaryListCell;
	actions?: SummaryListActions;
	classes?: string;
}

export interface SummaryListProps {
	rows: SummaryListRow[];
	classes?: string;
	attributes?: Record<string, string>;
	card?: {
		title?: SummaryListCell;
		actions?: SummaryListActions;
		classes?: string;
		attributes?: Record<string, string>;
	};
}