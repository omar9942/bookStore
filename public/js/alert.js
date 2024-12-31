export const hideAlert = () => {
	const el = document.querySelector(".alert");
	if (el) el.parentElement.removeChild(el);
};

// Type is 'success' or 'error'
export const showAlert = (msg) => {
	hideAlert();
	const markup = `<div class="alert">${msg}</div>`;
	document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
	setTimeout(hideAlert, 5000);
};
