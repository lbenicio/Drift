export interface GistFile {
	filename: string
	content: () => Promise<string>
}

export interface Gist {
	id: string
	created_at: Date
	description: String
	files: GistFile[]
}
