"use client"

import { TOKEN_COOKIE_NAME } from "@lib/constants"
import { getCookie } from "cookies-next"
import styles from "./admin.module.css"
import PostTable from "./post-table"
import UserTable from "./user-table"

export const adminFetcher = async (
	url: string,
	options?: {
		method?: string
		body?: any
	}
) =>
	fetch("/server-api/admin" + url, {
		method: options?.method || "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getCookie(TOKEN_COOKIE_NAME)}`
		},
		body: options?.body && JSON.stringify(options.body)
	})

const Admin = () => {
	return (
		<div className={styles.adminWrapper}>
			<h2>Administration</h2>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 4
				}}
			>
				<UserTable />
				<PostTable />
			</div>
		</div>
	)
}

export default Admin
