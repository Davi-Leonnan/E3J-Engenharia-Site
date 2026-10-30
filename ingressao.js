const teamWindow = document.querySelector("[data-team-window]");
const teamTrack = document.querySelector(".team-track");
const teamCards = [...document.querySelectorAll(".member-card")];
const previousButton = document.querySelector("[data-team-prev]");
const nextButton = document.querySelector("[data-team-next]");
const toggleButton = document.querySelector("[data-team-toggle]");
const teamSection = document.querySelector("#membros");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (teamWindow && teamTrack && teamCards.length && previousButton && nextButton && toggleButton && teamSection) {
	let timer = null;
	let sectionIsVisible = false;
	let pointerIsOver = false;
	let focusIsWithin = false;
	let userPaused = reducedMotion.matches;

	const cardStep = () => {
		const card = teamCards[0];
		const gap = Number.parseFloat(getComputedStyle(teamTrack).columnGap) || 0;
		return card.getBoundingClientRect().width + gap;
	};

	const updateControls = () => {
		const maxScroll = teamWindow.scrollWidth - teamWindow.clientWidth;
		previousButton.disabled = teamWindow.scrollLeft <= 2;
		nextButton.disabled = teamWindow.scrollLeft >= maxScroll - 2;
		toggleButton.disabled = reducedMotion.matches;
		toggleButton.setAttribute("aria-pressed", String(userPaused || reducedMotion.matches));
		toggleButton.setAttribute("aria-label", reducedMotion.matches ? "Avanço automático desativado pela preferência de movimento reduzido" : userPaused ? "Retomar esteira" : "Pausar esteira");
		toggleButton.setAttribute("title", reducedMotion.matches ? "Avanço automático desativado pela preferência de movimento reduzido" : userPaused ? "Retomar esteira" : "Pausar esteira");
		toggleButton.querySelector("span").textContent = userPaused || reducedMotion.matches ? "▶" : "Ⅱ";
	};

	const stopTimer = () => {
		if (timer) window.clearInterval(timer);
		timer = null;
	};

	const advanceTrack = () => {
		const maxScroll = teamWindow.scrollWidth - teamWindow.clientWidth;
		if (maxScroll <= 2) return;

		if (teamWindow.scrollLeft >= maxScroll - 4) {
			teamWindow.scrollTo({ left: 0, behavior: "smooth" });
			return;
		}

		teamWindow.scrollBy({ left: cardStep(), behavior: "smooth" });
	};

	const shouldPause = () => userPaused || pointerIsOver || focusIsWithin || document.hidden || !sectionIsVisible || reducedMotion.matches;

	const syncPlayback = () => {
		if (shouldPause()) {
			stopTimer();
		} else if (!timer) {
			timer = window.setInterval(advanceTrack, 4300);
		}
		updateControls();
	};

	previousButton.addEventListener("click", () => {
		userPaused = true;
		teamWindow.scrollBy({ left: -cardStep(), behavior: "smooth" });
		syncPlayback();
	});

	nextButton.addEventListener("click", () => {
		userPaused = true;
		teamWindow.scrollBy({ left: cardStep(), behavior: "smooth" });
		syncPlayback();
	});

	toggleButton.addEventListener("click", () => {
		userPaused = !userPaused;
		syncPlayback();
	});

	teamWindow.addEventListener("pointerenter", () => {
		pointerIsOver = true;
		syncPlayback();
	});

	teamWindow.addEventListener("pointerleave", () => {
		pointerIsOver = false;
		syncPlayback();
	});

	teamWindow.addEventListener("focusin", () => {
		focusIsWithin = true;
		syncPlayback();
	});

	teamWindow.addEventListener("focusout", (event) => {
		if (!teamWindow.contains(event.relatedTarget)) {
			focusIsWithin = false;
			syncPlayback();
		}
	});

	teamWindow.addEventListener("scroll", updateControls, { passive: true });
	document.addEventListener("visibilitychange", syncPlayback);
	reducedMotion.addEventListener("change", (event) => {
		if (event.matches) userPaused = true;
		syncPlayback();
	});

	if ("IntersectionObserver" in window) {
		const cardObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		}, { root: teamWindow, threshold: 0.18 });

		teamCards.forEach((card) => cardObserver.observe(card));

		const sectionObserver = new IntersectionObserver(([entry]) => {
			sectionIsVisible = entry.isIntersecting;
			syncPlayback();
		}, { threshold: 0.2 });
		sectionObserver.observe(teamSection);
	} else {
		teamCards.forEach((card) => card.classList.add("is-visible"));
		sectionIsVisible = true;
	}

	window.addEventListener("resize", updateControls);
	updateControls();
	syncPlayback();
}
