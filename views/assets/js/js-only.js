document.body.classList += ' govuk-frontend-supported'
document.querySelectorAll(".js-only").forEach((el) => {
    el.classList.remove("js-only")
})