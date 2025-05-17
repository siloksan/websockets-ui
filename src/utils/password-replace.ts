export function passwordReplace(message: string) {
	// for some tough guy)))
	return message.replace(/(\\"password\\":\\"[^"]*\\")/, '"password":"****"');
}
