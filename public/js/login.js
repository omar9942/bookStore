import { showAlert } from "./alert";

export const login = async (email, password) => {
	try {
		const res = await fetch({
			method: "POST",
			url: "http://localhost:5000/api/v1/users/login",
			data: {
				email,
				password,
			},
			withCredentials: true,
		});
		setTimeout(() => {
			location.assign("/");
		}, 1500);
	} catch (err) {
		showAlert(err.response.data.message);
	}
};

export const logout = async () => {
	const res = await axios({
		method: "GET",
		url: "http://localhost:5000/api/v1/users/logout",
	});
	// Must be set to true or it will reload the same page form cache
	if (res.data.status === "success") location.reload(true);
};
