//#region node_modules/.nitro/vite/services/ssr/assets/phone-J9aUwa-X.js
/** Egyptian phone helpers. WhatsApp is opened externally — no chat is stored. */
function normalizePhone(input) {
	if (!input) return null;
	const digits = input.replace(/[^\d]/g, "");
	if (!digits) return null;
	let n = digits;
	if (n.startsWith("0020")) n = n.slice(4);
	else if (n.startsWith("20")) n = n.slice(2);
	if (n.startsWith("0")) n = n.slice(1);
	if (n.length < 8 || n.length > 11) return n;
	return n;
}
function displayPhone(input) {
	if (!input) return "—";
	const n = normalizePhone(input);
	if (!n) return input;
	if (n.length === 10 && n.startsWith("1")) return `0${n}`;
	if (n.length === 9) return `0${n}`;
	return input.trim();
}
/** E.164-ish digits for wa.me (Egypt default). */
function whatsappDigits(input) {
	const n = normalizePhone(input);
	if (!n) return null;
	if (n.startsWith("1") && n.length >= 9) return `20${n}`;
	if (n.length >= 8) return `20${n}`;
	return null;
}
function whatsappUrl(phone, message) {
	const digits = whatsappDigits(phone);
	if (!digits) return null;
	const base = `https://wa.me/${digits}`;
	if (!message) return base;
	return `${base}?text=${encodeURIComponent(message)}`;
}
//#endregion
export { normalizePhone as n, whatsappUrl as r, displayPhone as t };
