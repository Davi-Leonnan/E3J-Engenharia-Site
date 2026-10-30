const navigation = document.querySelector("#navegacao");
const menu = document.querySelector("#menu");
const menuButton = navigation?.querySelector(".menu-toggle");
const themeToggle = document.querySelector("#theme-toggle");

const setTheme = (theme) => {
	document.documentElement.dataset.theme = theme;
	if (!themeToggle) return;

	const nextTheme = theme === "dark" ? "claro" : "escuro";
	themeToggle.setAttribute("aria-label", `Ativar tema ${nextTheme}`);
	themeToggle.setAttribute("title", `Ativar tema ${nextTheme}`);
	themeToggle.querySelector(".theme-icon").textContent = theme === "dark" ? "☼" : "☾";
};

let savedTheme = null;
try {
	savedTheme = localStorage.getItem("e3j-theme");
} catch {
	// The default theme still works when storage is unavailable.
}
setTheme(savedTheme === "light" ? "light" : "dark");

themeToggle?.addEventListener("click", () => {
	const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
	setTheme(nextTheme);
	try {
		localStorage.setItem("e3j-theme", nextTheme);
	} catch {
		// Theme switching remains available for the current page.
	}
});

if (navigation && menu && menuButton) {
	const closeMenu = () => {
		navigation.classList.remove("menu-open");
		menuButton.setAttribute("aria-expanded", "false");
		menuButton.setAttribute("aria-label", "Abrir menu");
	};

	menuButton.addEventListener("click", () => {
		const isOpen = navigation.classList.toggle("menu-open");
		menuButton.setAttribute("aria-expanded", String(isOpen));
		menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
	});

	menu.addEventListener("click", (event) => {
		if (event.target.closest("a")) closeMenu();
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") closeMenu();
	});

	window.addEventListener("resize", () => {
		if (window.innerWidth > 1020) closeMenu();
	});

	const updateNavigation = () => {
		navigation.classList.toggle("is-scrolled", window.scrollY > 12);
	};

	updateNavigation();
	window.addEventListener("scroll", updateNavigation, { passive: true });
}

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && revealItems.length) {
	document.documentElement.classList.add("motion-ready");

	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.14 });

	revealItems.forEach((item) => revealObserver.observe(item));
}
