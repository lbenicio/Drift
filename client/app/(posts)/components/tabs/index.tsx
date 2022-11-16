import * as RadixTabs from "@radix-ui/react-tabs"
import FormattingIcons from "app/(posts)/new/components/edit-document-list/edit-document/formatting-icons"
import { ChangeEvent, useRef } from "react"
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor"
import Preview, { StaticPreview } from "../preview"
import styles from "./tabs.module.css"

type Props = RadixTabs.TabsProps & {
	isEditing: boolean
	defaultTab: "preview" | "edit"
	handleOnContentChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
	onPaste?: (e: any) => void
	title?: string
	content?: string
	preview?: string
}

export default function DocumentTabs({
	isEditing,
	defaultTab,
	handleOnContentChange,
	onPaste,
	title,
	content,
	preview,
	...props
}: Props) {
	const codeEditorRef = useRef<TextareaMarkdownRef>(null)

	const handleTabChange = (newTab: string) => {
		if (newTab === "preview") {
			codeEditorRef.current?.focus()
		}
	}

	return (
		<RadixTabs.Root
			{...props}
			onValueChange={handleTabChange}
			className={styles.root}
			defaultValue={defaultTab}
		>
			<RadixTabs.List className={styles.list}>
				<RadixTabs.Trigger value="edit" className={styles.trigger}>
					{isEditing ? "Edit" : "Raw"}
				</RadixTabs.Trigger>
				<RadixTabs.Trigger value="preview" className={styles.trigger}>
					{isEditing ? "Preview" : "Rendered"}
				</RadixTabs.Trigger>
			</RadixTabs.List>
			<RadixTabs.Content value="edit">
				<FormattingIcons textareaRef={codeEditorRef} />
				<div
					style={{
						marginTop: 6,
						display: "flex",
						flexDirection: "column"
					}}
				>
					<TextareaMarkdown.Wrapper ref={codeEditorRef}>
						<textarea
							readOnly={!isEditing}
							onPaste={onPaste ? onPaste : undefined}
							ref={codeEditorRef}
							placeholder=""
							value={content}
							onChange={handleOnContentChange}
							// TODO: Textarea should grow to fill parent if height == 100%
							style={{ flex: 1, minHeight: 350 }}
							// className={styles.textarea}
						/>
					</TextareaMarkdown.Wrapper>
				</div>
			</RadixTabs.Content>
			<RadixTabs.Content value="preview">
				{isEditing ? (
					<Preview height={"100%"} title={title} content={content} />
				) : (
					<StaticPreview height={"100%"} preview={preview || ""} />
				)}
			</RadixTabs.Content>
		</RadixTabs.Root>
	)
}