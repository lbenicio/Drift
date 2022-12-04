"use client"

import Tooltip from "@components/tooltip"
import { timeUntil } from "@lib/time-ago"
import { useEffect, useMemo, useState } from "react"
import Badge from "../badge"

const ExpirationBadge = ({
	postExpirationDate
}: {
	postExpirationDate: Date | string | null
	onExpires?: () => void
}) => {
	const expirationDate = useMemo(
		() => (postExpirationDate ? new Date(postExpirationDate) : null),
		[postExpirationDate]
	)
	const [timeUntilString, setTimeUntil] = useState<string | null>(
		expirationDate ? timeUntil(expirationDate) : null
	)

	useEffect(() => {
		let interval: NodeJS.Timer | null = null
		if (expirationDate) {
			interval = setInterval(() => {
				if (expirationDate) {
					setTimeUntil(timeUntil(expirationDate))
				}
			}, 1000)
		}

		return () => {
			if (interval) {
				clearInterval(interval)
			}
		}
	}, [expirationDate])

	const isExpired = useMemo(() => {
		return timeUntilString === "in 0 seconds"
	}, [timeUntilString])

	if (!expirationDate) {
		return null
	}

	return (
		<Badge type={isExpired ? "error" : "warning"}>
			<Tooltip
				content={`${expirationDate.toLocaleDateString()} ${expirationDate.toLocaleTimeString()}`}
			>
				<>{isExpired ? "Expired" : `Expires ${timeUntilString}`}</>
			</Tooltip>
		</Badge>
	)
}

export default ExpirationBadge
