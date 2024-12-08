export function tokenCookieOptions() {
	return {
		httpOnly: true,
		signed: true,
		expires: new Date(Date.now() + 1000 * 60 * 2), // 2 Mins
	};
}
