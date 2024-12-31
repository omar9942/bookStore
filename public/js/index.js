const sForm = document.querySelector(".searchForm ");
const cancel = document.querySelector(".searchForm span");
const search = document.querySelector("li.search");
const overlay = document.querySelector(".dark-overlay");

search.addEventListener("click", () => {
	sForm.style.display = "block";
	overlay.style.display = "block";
});

cancel.addEventListener("click", () => {
	sForm.style.display = "none";
	overlay.style.display = "none";
});
